import React, { useEffect, useState,useMemo } from 'react';
import { Container,InputAdornment , Typography, Paper,Pagination, Table,Tooltip, TableBody, TableCell, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, TextField, Checkbox,FormLabel,FormGroup, FormControlLabel, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { API_ROUTES } from '@/utils/constants';


import { Box } from '@mui/system';

import {TextEditorTipTap} from '../../../compenent/EditorTipTap';


export default function Urunler() {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [newItem, setNewItem] = useState({
      aciklama: '',
      baslik: '',
      kapakFotografi: null,
      fiyat: '',
      durum: true
    });
    const [content, setContent] = useState('');
    const [selectedRows, setSelectedRows] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchPage, setSearchPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [deleteError, setDeleteError] = useState('');
    const [uyariMesaji, setUyariMesaji] = useState("");
    const [uyariMesajiEkle, setUyariMesajiEkle] = useState("");

    const [urunKategoriler, setUrunKategoriler] = useState([]);
    const [selectedKategori, setSelectedKategori] = useState({});

    const [urunVitrin, setUrunVitrin] = useState([]);
    const [selectedVitrin, setSelectedVitrin] = useState({ id: null, baslik: '' });

    const [bedenler,setBedenler] = useState([])
    const [ozellikler,setOzellikler] = useState([])



    const [isSaving, setIsSaving] = useState(false);

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const [warningDialogOpen, setWarningDialogOpen] = useState(false);

    const user = useSelector((state) => state.user);
    const router = useRouter();

    const [albumImages, setAlbumImages] = useState([]);
    const [removedImageIds, setRemovedImageIds] = useState([]);
    const [createImageAlbum, setCreateImageAlbum] = useState([]);
    const imagesCount = useMemo(() => {
        return albumImages.length + (createImageAlbum ? createImageAlbum.length : 0);
    }, [albumImages, createImageAlbum]);


    const beden = Array.from({ length: 11 }, (_, index) => ({ numara: 36 + index * 1, durum: false }));

    const ozellik = [
      { name: 'S', durum: false },
      { name: 'M', durum: false },
      { name: 'L', durum: false },
      { name: 'XL', durum: false },
      { name: 'XXL', durum: false },
      { name: 'XXXL', durum: false },
      { name: 'Çelik Burunlu', durum: false },
      { name: 'Çelik Arataban', durum: false },
      { name: 'Kaygan Zemin', durum: false },
      { name: 'Anti-Statik', durum: false },
      { name: 'Çift Dansite', durum: false },
      { name: 'Kaynakçı Ayakkabısı', durum: false },
    ];
  
    // search box değişkenleri

    const [searchQuery, setSearchQuery] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [displayedData, setDisplayedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);


    useEffect(() => {
      const normalizeString = (str) => {
        return str.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      };
    
      const filtered = data.filter(item => normalizeString(item.baslik).includes(normalizeString(searchQuery)));
      setFilteredData(filtered);
      // Paginate based on the search page
      const newDisplayedData = filtered.slice((searchPage - 1) * itemsPerPage, searchPage * itemsPerPage);
      setDisplayedData(newDisplayedData);
    
      // Update total pages
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }, [searchQuery, data, searchPage, itemsPerPage]);
    
    const handleSearchChange = (event) => {
      const { value } = event.target;
      setSearchQuery(value);
      setSearchPage(1); // Reset search page to 1 when a new search is performed
    };


    const handleItemsPerPageChange = async (event) => {
      const newItemsPerPage = event.target.value;
      setItemsPerPage(newItemsPerPage);
    
      // Verileri güncelle
      try {
        const response = await axios.get(API_ROUTES.URUNLER_ACTIVE_FULL);
        const totalCount = response.data.length || 0;
        const totalPages = Math.ceil(totalCount / newItemsPerPage);
    
        // Mevcut sayfayı kontrol et ve uygun sayfayı ayarla
        let updatedPage = currentPage;
        if (totalPages < currentPage) {
          updatedPage = totalPages > 0 ? totalPages : 1;
        }
    
        // Verileri güncellenmiş sayfadan al
        await fetchData(updatedPage);
        
        // Toplam sayfa sayısını güncelle
        setTotalPages(totalPages);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


    const getResData = async () => {

      setIsLoading(true); // Veri yükleme başlamadan önce
      setHasError(false);
      try {
        const response = await axios.get(API_ROUTES.URUN_KATEGORI_LIST)
        setUrunKategoriler(response.data);
      } catch (error) {
        setHasError(true);
        // Opsiyonel: Hata detaylarını loglayabilir veya kullanıcıya gösterebilirsiniz.
      } finally {
        setIsLoading(false); // Veri yükleme tamamlandığında veya hata oluştuğunda
      }
    }


    useEffect(() => {
      if (!user.id) {
        router.push({
          pathname: "/login",
          query: {from: router.pathname},
        });
      }else{
        getResData()
      }
    }, [user,currentPage]);


    const getRes2Data = async () => {

        setIsLoading(true); // Veri yükleme başlamadan önce
        setHasError(false);
        try {
          const response = await axios.get(API_ROUTES.URUN_VITRIN_LIST)
          setUrunVitrin(response.data);
        } catch (error) {
          setHasError(true);
          // Opsiyonel: Hata detaylarını loglayabilir veya kullanıcıya gösterebilirsiniz.
        } finally {
          setIsLoading(false); // Veri yükleme tamamlandığında veya hata oluştuğunda
        }
      }
  
  
      useEffect(() => {
        if (!user.id) {
          router.push({
            pathname: "/login",
            query: {from: router.pathname},
          });
        }else{
          getRes2Data()
        }
      }, [user]);



      const getData = async () => {
        setIsLoading(true); // Veri yükleme başlamadan önce
        setHasError(false);
        try {
          const response = await axios.get(API_ROUTES.URUNLER_ACTIVE_FULL)
          setData(response.data);
          setTotalPages(Math.ceil(response.data.length / itemsPerPage));
        } catch (error) {
          setHasError(true);
          // Opsiyonel: Hata detaylarını loglayabilir veya kullanıcıya gösterebilirsiniz.
        } finally {
          setIsLoading(false); // Veri yükleme tamamlandığında veya hata oluştuğunda
        }
      }


    useEffect(() => {
      if (!user.id) {
        router.push({
          pathname: "/login",
          query: {from: router.pathname},
        });
      }else{
        getData()
      }
    }, [user,currentPage]);



    //beden düzenleme function
    const handleCheckboxChange = (index) => {
      const updatedBedenler = [...bedenler];
      updatedBedenler[index].durum = !updatedBedenler[index].durum;
      setBedenler(updatedBedenler);
    };


    //özellik düzenleme function
    const handleOzellikCheckboxChange = (index) => {
      const updatedOzellikler = [...ozellikler];
      updatedOzellikler[index].durum = !updatedOzellikler[index].durum;
      setOzellikler(updatedOzellikler);
    };

    



    const handlePageChange = (event, value) => {
      if (searchQuery) {
        setSearchPage(value);
      } else {
        setCurrentPage(value);
      }
  
      // Scroll smoothly to the top of the page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };
    
      const handleOpenAddDialog = () => {
        // State'leri sıfırla, sonra dialogu aç
        setNewItem({
          aciklama: "",
          baslik: '',
          kapakFotografi: null,
          fiyat: '',
          durum: true
        });
        setUyariMesajiEkle("");
        setSaveError("");
        setSelectedKategori({});
        setCreateImageAlbum([]);
        setSelectedVitrin({});
        setBedenler(beden)
        setOzellikler(ozellik)
        setOpenAddDialog(true);
      };


      const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
      };


      
      const handleOpen = (item) => {
        // Temiz bir başlangıç için gerekli state'leri sıfırla
        setSaveError("");
        setUyariMesaji("");
        setSelectedKategori({});
        setSelectedVitrin({});
        setRemovedImageIds([]);
        setCreateImageAlbum([]);
        setAlbumImages([]);
      

        axios.get(`${API_ROUTES.URUNLER}${item.id}/`)
        .then(response => {

          // console.log("res:",response.data)

          setSelectedItem(response.data);
          
          if(response.data.urun_kategori){
            setSelectedKategori(response.data.urun_kategori)
          }
          if(response.data.vitrin_kategori){
            setSelectedVitrin(response.data.vitrin_kategori)
          }
          if(response.data.aciklama){
            setContent(response.data.aciklama);
          }

          // İlgili bedenleri yükle

          setBedenler(response.data.bedenler);


          // İlgili özellikleri yükle

          setOzellikler(response.data.ozellikler);

        })
        .catch(error => setSaveError("Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."))
        .finally(() => {
          setDataLoading(false);
        });
        
      
        // İlgili albüm resimlerini yükle
        axios.get(API_ROUTES.ALBUM_IMAGES_KATEGORI_FILTER.replace("seciliKategori", item.id)) 
        .then(response => {
            setAlbumImages(response.data);
        })
        .catch(error => setSaveError("Bir hata oluştu. Lütfen daha sonra tekrar deneyiniz."));

        setOpen(true);
      };
      
      
      const handleClose = () => {
        setCreateImageAlbum([]);
        setAlbumImages([]);
        setOpen(false);
        setDataLoading(true);
      };
    
    
    
      const handleSave = async (editedItem, selectedVitrin,selectedKategori) => {
        if (!editedItem.baslik || !editedItem.kapak_fotografi || !selectedKategori.id) {
          setUyariMesaji("Başlık, kapakfotoğrafı ve kategori alanları zorunlu alandır. Lütfen tüm zorunlu alanları doldurunuz.");
          return;
        }
        setUyariMesaji("");
        
      
        try {
          const formData = new FormData();
      
          if (editedItem["kapak_fotografi_file"]) {
            formData.append('kapak_fotografi', editedItem["kapak_fotografi_file"]);
          }
      
          formData.append("durum", editedItem["durum"]);
          formData.append("baslik", editedItem["baslik"]);

          if(editedItem["aciklama"]){
            formData.append("aciklama", editedItem["aciklama"]);
          }

          
         

          formData.append("urun_kategori", selectedKategori.id);
          
          if(selectedVitrin?.id){
            formData.append("vitrin_kategori", selectedVitrin.id);
          }
          
          if(editedItem["fiyat"]){
            formData.append("fiyat", editedItem["fiyat"]);
          }

          
          formData.append("bedenler", JSON.stringify(bedenler));

          formData.append("ozellikler", JSON.stringify(ozellikler));


          setIsSaving(true);
      
          const response = await axios.put(API_ROUTES.URUNLER_DETAIL.replace("id",editedItem.id), formData)
          
          const updateDateDetail ={ 
            id:editedItem.id,
            baslik: editedItem.baslik,
            slug: editedItem.slug,
            kapak_fotografi: editedItem.kapak_fotografi,
            fiyat: editedItem.fiyat,
            durum: editedItem.durum,
            urun_kategori: selectedKategori,
            vitrin_kategori: selectedVitrin
          }

          const updatedData = data.map(item => item.id === editedItem.id ? updateDateDetail : item);
        
          setData(updatedData);
      
          if (removedImageIds.length > 0) {
            const stringIds = removedImageIds.map(id => id.toString());
            await axios.post(API_ROUTES.ALBUM_IMAGES_DELETE, { ids: stringIds });
          }
      
          if (createImageAlbum.length > 0) {
            const promises = createImageAlbum.map((item) => {
              const albumFormData = new FormData();
              albumFormData.append("urun_id", editedItem["id"]);
              albumFormData.append("image", item.backFile);
      
              return axios.post(API_ROUTES.ALBUM_IMAGES, albumFormData)
                         .catch(error => console.error('Resim yükleme sırasında hata oluştu:', error));
            });
      
            await Promise.all(promises);
          }


      
          handleClose(); // İşlemler tamamlandıktan sonra pencereyi kapat
        } catch (error) {
          console.error('Güncelleme sırasında hata oluştu:', error);
          setSaveError("Veri güncellenirken bir hata oluştu. Lütfen tekrar deneyiniz.");  // Hata mesajını ayarla
        }finally{
          setIsSaving(false);
          
        }
      };
      
      
    
    
    
    
      const handleAddNewItem = async (selectedKategori,selectedVitrin) => {

        
        if (!newItem.baslik || !newItem.kapakFotografi || !selectedKategori.id ) {
            setUyariMesajiEkle("Başlık, kapakfotoğrafı ve kategori alanları zorunlu alandır. Lütfen tüm zorunlu alanları doldurunuz.");
            return;
        }
        setUyariMesajiEkle("");
      
        const formData = new FormData();
        formData.append('kapak_fotografi', newItem["kapakFotografi_file"]);
        formData.append("durum", newItem["durum"]);
        formData.append("aciklama", newItem["aciklama"]);
        formData.append("baslik", newItem["baslik"]);
        formData.append("fiyat", newItem["fiyat"]);
        formData.append("urun_kategori", selectedKategori.id);
        
        if (selectedVitrin.id){
            formData.append("vitrin_kategori", selectedVitrin.id);
        }

        formData.append("bedenler", JSON.stringify(bedenler));

        formData.append("ozellikler", JSON.stringify(ozellikler));



        setIsSaving(true);
      
        try {
          const urunlerResponse = await axios.post(API_ROUTES.URUNLER, formData);
          const newUrunId = urunlerResponse.data.id;
      
          const responseNew = await axios.get(API_ROUTES.URUNLER_ACTIVE_FULL)
          setData(responseNew.data);
          setTotalPages(Math.ceil(responseNew.data.length / itemsPerPage));
      
          if (createImageAlbum.length > 0) {
            const promises = createImageAlbum.map((item) => {
              const albumFormData = new FormData();
              albumFormData.append("urun_id", newUrunId);
              albumFormData.append("image", item.backFile);
      
              return axios.post(API_ROUTES.ALBUM_IMAGES, albumFormData);
            });
      
            await Promise.all(promises);
          }

      
          handleCloseAddDialog();
        } catch (error) {
          console.error('İşlem sırasında hata oluştu:', error);
          setSaveError("Yeni veri eklemesi sırasında bir hata meydana geldi. Lütfen işleminizi tekrar gerçekleştirmeyi deneyiniz."); 
        }finally{
          setIsSaving(false);
        }
      };
      
      
      const handleSelectRow = (id) => {
        setSelectedRows(prevSelectedRows => ({
          ...prevSelectedRows,
          [id]: !prevSelectedRows[id]
        }));
    };
    const handleSelectAllRows = (event) => {
        if (event.target.checked) {
          const newSelectedRows = {};
          data.forEach(row => newSelectedRows[row.id] = true);
          setSelectedRows(newSelectedRows);
        } else {
          setSelectedRows({});
        }
    };

    const handleCloseWarningDialog = () => {
      setWarningDialogOpen(false);
    };


    const handleOpenDeleteConfirm = () => {
      const ids = Object.keys(selectedRows).filter(id => selectedRows[id]);
      if (ids.length === 0) {
        // Hiçbir öğe seçilmemişse uyarı diyalogunu aç
        setWarningDialogOpen(true);
      } else {
        // Seçili öğeler varsa onay penceresini aç
        setSelectedIds(ids);
        setDeleteConfirmOpen(true);
      }
    };
  
    
    const handleCloseDeleteConfirm = () => {
      setDeleteConfirmOpen(false);
    };

    

    const handleConfirmDelete = async () => {
        setDeleteError('');
        try {
            await axios.post(API_ROUTES.URUNLER_DELETE, { ids: selectedIds });
            const response = await axios.get(API_ROUTES.URUNLER);
            const newTotalCount = response.data.length;
            const newTotalPages = Math.ceil(newTotalCount / 10);
            setTotalPages(newTotalPages);
    
            let updatedPage = currentPage;
            if (newTotalPages < currentPage) {
                updatedPage = newTotalPages;
            }
    
            if (newTotalPages === 0) {
                setCurrentPage(1);
                setData([]);
                setSelectedRows({});
                setDeleteConfirmOpen(false);
            } else {
                // Güncellenmiş sayfanın verilerini al
                await fetchData(updatedPage);
            }
        } catch (error) {
            console.error('Toplu silme işlemi sırasında hata oluştu:', error);
            setDeleteError('Veriler silinirken bir hata oluştu. Lütfen tekrar deneyin.');
            setDeleteConfirmOpen(false);
        }
        finally{
          handleCloseDeleteConfirm();
        }
    };

    const fetchData = async (page) => {
      setIsLoading(true);
      try {
        const response = await axios.get(API_ROUTES.URUNLER_ACTIVE_FULL);
        const dataItems = response.data || [];
        const totalCount = dataItems.length || 0;
        const totalPages = Math.ceil(totalCount / itemsPerPage);
    
        // Verileri ve toplam sayfa sayısını güncelle
        setData(dataItems);
        setTotalPages(totalPages);
    
        // Mevcut sayfayı kontrol et ve ayarla
        if (page > totalPages) {
          setCurrentPage(totalPages > 0 ? totalPages : 1);
        } else {
          setCurrentPage(page);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    
    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
        </div>
      );
    }
    
    
    if (hasError) {
        return (
          <div style={{ textAlign: 'center', marginTop: '50px', marginLeft:'50px' }}>
            <Typography variant="h6">Veri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyiniz.</Typography>
            
          </div>
        );
    }

    

    const handleFileChange = (event, fieldName) => {
        const file = event.target.files[0];
      
        if (file) {

          if (fieldName === "kapak_fotografi") {
            const reader = new FileReader();
            reader.onload = (e) => {
              setSelectedItem((prevItem) => ({
                ...prevItem,
                [fieldName]: e.target.result,
                [fieldName + '_file']: file,
              }));
            };
            reader.readAsDataURL(file);
            event.target.value = '';

          } 
                }
    };

      const handleRemoveImage = (fieldName) => {
        setSelectedItem((prevItem) => ({
          ...prevItem,
          [fieldName]: null,
        }));
      

      };


      const handleFileChangeEkle = (event, fieldName) => {
        const file = event.target.files[0];
        if (fieldName === "kapakFotografi") {
          const reader = new FileReader();
          reader.onload = (e) => {
            setNewItem((prevItem) => ({
              ...prevItem,
              [fieldName]: e.target.result,
              [fieldName + '_file']: file,
            }));
          };
          reader.readAsDataURL(file);
          event.target.value = '';

        }
      };
    
      const handleRemoveImageEkle = (fieldName) => {
        setNewItem(prevItem => ({
          ...prevItem,
          [fieldName]: null
        }));
      };

      const imgAlbumRemove = (imageId) => {
        // Yeni dizi, seçilen ID'ye sahip olmayan tüm görselleri içerecek şekilde oluşturulur
        const updatedImages = albumImages.filter(image => image.id !== imageId);
        // albumImages state'ini güncelle
        setAlbumImages(updatedImages);
        setRemovedImageIds(prevIds => [...prevIds, imageId]);
      };


      const handleFileAlbum = (event) => {
        const file = event.target.files[0];
      
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setCreateImageAlbum(prevItem => ([
                    ...prevItem,
                    {frontFile: e.target.result, backFile: file}  
                ]));
            };
            reader.readAsDataURL(file);
            event.target.value = '';

        } 

    };

    const imgCreateAlbumRemove = (uiIndex) => {
      // UI'da görseller ters sıralı gösteriliyorsa, gerçek index'i hesapla
      const realIndex = createImageAlbum.length - 1 - uiIndex;
    
      // Güncellenmiş album dizisini oluştur
      const updatedAlbum = createImageAlbum.filter((_, index) => index !== realIndex);
    
      // Album state'ini güncelle
      setCreateImageAlbum(updatedAlbum);
    };
    

    function truncateText(text, maxLength) {
      
      return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    }




    return(
        <>
             <>
             <Container maxWidth="lg" style={{  position: 'relative' }}>
                {deleteError && <div style={{ color: '#f44336', textAlign: 'center', marginBottom: '10px', fontSize: '0.75rem' }}>{deleteError}</div>}
                <Paper elevation={2} style={{ padding: '15px', overflowX: 'auto', backgroundColor: 'white' }}>
                  {data.length > 0 && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={handleOpenDeleteConfirm}
                      style={{ backgroundColor: "#d32f2f", color: '#fff', marginBottom: "10px", textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Sil
                    </Button>
                  )}
                  {/* search box burada */}
                  <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                      <TextField
                      variant="outlined"
                      size="small"
                      label="Ürün Arama"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      fullWidth
                      />

                      <FormControl variant="outlined" size="small" style={{ minWidth: 120, marginLeft: '10px' }}>
                        <InputLabel>Sayfa Başına</InputLabel>
                        <Select
                          value={itemsPerPage}
                          onChange={handleItemsPerPageChange}
                          label="Sayfa Başına"
                        >
                          <MenuItem value={20}>20</MenuItem>
                          <MenuItem value={30}>30</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  <Table size="small">
                    
                    <TableHead>
                      
                      <TableRow style={{ backgroundColor: '#1976d2' }}> 

                        <TableCell padding="checkbox">
                          <Checkbox
                            onChange={handleSelectAllRows}
                            checked={Object.keys(selectedRows).length > 0 && Object.keys(selectedRows).length === data.length}
                            indeterminate={Object.keys(selectedRows).length > 0 && Object.keys(selectedRows).length < data.length}
                            size="small"
                            style={{ color: '#fff' }}  
                          />
                        </TableCell>
                        <TableCell style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Başlık</TableCell>
                        <TableCell style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Kapak Fotoğrafı</TableCell>
                        <TableCell style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Fiyat</TableCell>
                        <TableCell style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Kategori Adı</TableCell>
                        <TableCell style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Vitrin Adı</TableCell>
                        <TableCell style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Durum</TableCell>
                        <TableCell style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>Detaylar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedData.map(row => (
                        <TableRow key={row.slug}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedRows[row.id] || false}
                              onChange={() => handleSelectRow(row.id)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell style={{ fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={row.baslik} placement="top">
                              <span>{truncateText(row.baslik, 20)}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell style={{ fontSize: '0.75rem' }}>{row.kapak_fotografi ? 'Mevcut' : 'Mevcut Değil'}</TableCell>

                          <TableCell style={{ fontSize: '0.75rem' }}>
                            {row.fiyat || row.fiyat === 0 ? `${Number(row.fiyat).toFixed(2)} TL` : 'Mevcut Değil'}
                          </TableCell>

    
                          <TableCell style={{ fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={row.urun_kategori ? row.urun_kategori.baslik : 'Mevcut Değil'} placement="top">
                              <span>
                                {truncateText(row.urun_kategori ? row.urun_kategori.baslik : 'Mevcut Değil', 20)}
                              </span>
                            </Tooltip>
                          </TableCell>

                          <TableCell style={{ fontSize: '0.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Tooltip title={row.vitrin_kategori ? row.vitrin_kategori.baslik : 'Mevcut Değil'} placement="top">
                              <span>
                                {truncateText(row.vitrin_kategori?.id ? row.vitrin_kategori.baslik : 'Mevcut Değil', 20)}
                              </span>
                            </Tooltip>
                          </TableCell>

                          <TableCell style={{ fontSize: '0.75rem' }}>{row.durum ? 'Aktif' : 'Pasif'}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<InfoIcon />}
                              onClick={() => handleOpen(row)}
                              style={{ backgroundColor: '#1976d2', color: '#fff', textTransform: 'none', fontSize: '0.75rem' }}
                            >
                              Detaylar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <Button
                      variant="contained"
                      size="small"
                      style={{ backgroundColor: '#388e3c', color: '#fff', textTransform: 'none', fontSize: '0.75rem' }}
                      onClick={handleOpenAddDialog}
                      startIcon={<AddIcon />}
                    >
                      Ekle
                    </Button>
                  </div>
                  {data.length > 0 && (
                    <Pagination
                      count={totalPages}
                      page={searchQuery ? searchPage : currentPage}
                      onChange={handlePageChange}
                      variant="outlined"
                      size="small"
                      style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}
                    />
                  )}
                </Paper>
              </Container>


{/*  buraya LOADİNG GELECEK */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        {dataLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <CircularProgress size={64}/>
          </div>
        ) : (
          <>
          
            <DialogTitle>
              Düzenleme
              <IconButton
                onClick={handleClose}
                style={{ position: 'absolute', right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>

                <TextField
                    label="Başlık"
                    value={selectedItem ? selectedItem.baslik : ''}
                    onChange={(e) => setSelectedItem({ ...selectedItem, baslik: e.target.value })}
                    fullWidth
                    margin="normal"
                />
                {/* Kapak Fotoğrafı */}
                <div style={{ textAlign: 'center', marginBottom: '20px' ,marginTop:'20px'}}>
                    <div style={{ border: '2px dashed grey', width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                        {selectedItem && selectedItem.kapak_fotografi ? (
                            <>
                                <Typography variant="subtitle1" style={{ marginBottom: '10px', position: 'absolute', top: 0, left: 10 }}>
                                    Kapak Fotoğrafı:
                                </Typography>
                                <img
                                    src={selectedItem.kapak_fotografi}
                                    alt="Kapak Fotoğrafı"
                                    style={{ maxWidth: '50%', maxHeight: '100px', position: 'relative' }}
                                />
                                {/* X simgesi */}
                                <IconButton
                                    style={{ fontSize: '20px', backgroundColor: 'transparent', color: 'red', position: 'absolute', top: 0, right: 0 }}
                                    onClick={() => handleRemoveImage("kapak_fotografi")}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </>
                        ) : (<>
                            <Typography variant="subtitle1" style={{ marginBottom: '10px', position: 'absolute', top: 0, left: 10 }}>
                                    Kapak Fotoğrafı:
                            </Typography>
                            <label htmlFor="kapak_fotografiInput">
                                <IconButton
                                    style={{ fontSize: '50px', color: 'green', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                                    component="span"
                                >
                                    <AddPhotoAlternateIcon />
                                </IconButton>
                            </label>
                            </>
                        )}
                    </div>

                    {/* Dosya Ekleme Input */}
                    <input
                        type="file"
                        id="kapak_fotografiInput"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e, "kapak_fotografi")}
                    />
                </div>


                <TextField
                    label="Fiyat"
                    value={selectedItem && selectedItem.fiyat !== null ? selectedItem.fiyat : ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        // Regex to check user input, only allowing numbers and at most two decimal places
                        const matched = value.match(/^\d*(\.\d{0,2})?$/);

                        // If the entered value is valid, update the state
                        if (matched) {
                            setSelectedItem({ ...selectedItem, fiyat: value });
                        }
                    }}
                    fullWidth
                    margin="normal"
                    InputProps={{
                        endAdornment: <InputAdornment position="end">TL</InputAdornment>,
                    }}
                />



                {/* acıklama*/}
            {selectedItem && (
              <>
                <Typography variant="subtitle1" style={{ marginBottom: '10px', marginTop:'10px'}}>
                  Açıklama (isteğe bağlı) :
                </Typography>
                <TextEditorTipTap selectedItem={selectedItem} setSelectedItem={setSelectedItem}/>
              </>
            )}




                {/* Görsel Galerisi */}
                <div style={{ border: '2px dashed grey', margin: '20px 0', overflowX: 'auto', height: '300px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <Typography variant="subtitle1" style={{ marginBottom: '10px', position: 'absolute', top: 0, left: 10 }}>
                        Galeri:
                    </Typography>
                    <div style={{ 
                        display: 'flex',
                        gap: '20px', // Öğeler arasındaki boşluk
                        alignItems: 'center', 
                        paddingLeft: imagesCount <= 2 ? 0 : "40px", 
                        minWidth: imagesCount <= 2 ? 'fit-content' : '100%' 
                    }}>

                        <div>
                            {/* Gizli Dosya Input */}
                            <input
                                type="file"
                                id="imageInput"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e)=>handleFileAlbum(e)}
                            />

                            {/* Görsel Ekleme Butonunu Çevreleyen Stil */}
                            <div style={{ border: '2px dashed grey', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '120px', height: '150px'}}>
                                <label htmlFor="imageInput">
                                <IconButton
                                    style={{ color: 'green' }} // Yeşil renkli ikon
                                    component="span"
                                >
                                    <AddPhotoAlternateIcon />
                                </IconButton>
                                </label>
                            </div>
                        </div>

                       


                        {/* createImageAlbum'dan Gelen Görseller */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {createImageAlbum.length > 0 && [...createImageAlbum].reverse().map((item, index) => (
                            <div key={index} style={{ border: '2px dashed grey', padding: '5px', width: '120px', height: '150px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img src={item.frontFile} alt={`Albüm Görseli ${index}`} style={{ maxWidth: '100px', height: 'auto', maxHeight: '80px' }} />
                                {/* Kapatma (Silme) İkonu */}
                                <IconButton onClick={() => imgCreateAlbumRemove(index)} style={{ position: 'absolute', top: 0, right: 0, color: 'red' }}>
                                <CloseIcon />
                                </IconButton>
                            </div>
                            ))}
                        </div>

                         

                        {albumImages.length > 0 &&  albumImages.map(image => (
                        <div key={image.id} style={{ border: '2px dashed grey', padding: '5px', width: '120px', height: '150px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img key={image.id} src={image.image} alt={`Görsel ${image.id}`} style={{ maxWidth: '100px', height: 'auto', maxHeight: '80px' }} />
                            <IconButton onClick={()=>{imgAlbumRemove(image.id)}} style={{ position: 'absolute', top: 0, right: 0, color: 'red' }}>
                              <CloseIcon />
                            </IconButton>
                        </div>
                        ))}
                        
                    </div>
                    
                </div>



                <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <Typography variant="h6" gutterBottom style={{ marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', color: '#555' }}>Bedenler</Typography>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                        {bedenler.map((beden, index) => (
                            <div key={beden.id} style={{ 
                                flex: '0 1 calc(33.3333% - 20px)',
                                marginBottom: '10px',
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '10px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={beden.durum}
                                            onChange={() => handleCheckboxChange(index)}
                                            style={{ padding: '0 10px' }}
                                        />
                                    }
                                    label={beden.numara}
                                />
                                {/* Buraya istediğiniz ekstra içerik veya mesaj ekleyebilirsiniz */}
                            </div>
                        ))}
                    </div>
                </div>


                <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <Typography variant="h6" gutterBottom style={{ marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', color: '#555' }}>Özellikler</Typography>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                        {ozellikler.map((ozellik, index) => (
                            <div key={ozellik.id} style={{ 
                                flex: '0 1 calc(33.3333% - 20px)',
                                marginBottom: '10px',
                                backgroundColor: '#fff',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '10px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={ozellik.durum}
                                            onChange={() => handleOzellikCheckboxChange(index)}
                                            style={{ padding: '0 10px' }}
                                        />
                                    }
                                    label={ozellik.name}
                                />
                                {/* Buraya istediğiniz ekstra içerik veya mesaj ekleyebilirsiniz */}
                            </div>
                        ))}
                    </div>
                </div>


                <FormControl fullWidth margin="normal">
                  <InputLabel style={{ marginBottom: '8px', marginTop: '-10px' }}>
                    Kategori
                  </InputLabel>
                  <Select
                    value={selectedKategori ? selectedKategori.id : ''} // selectedKategori varsa id'sini göster, yoksa boş
                    onChange={(e) => {
                      const selected = urunKategoriler.find(
                        (kategori) => kategori.id === e.target.value
                      );
                      setSelectedKategori(selected || {}); // Seçilen kategori objesini state'e kaydet
                    }}
                    renderValue={(selected) => {
                      if (selected) {
                        const kategori = urunKategoriler.find(
                          (kategori) => kategori.id === selected
                        );
                        return kategori ? kategori.baslik : 'Seçim Yapılmadı'; // Başlık ya da boş bir seçenek göster
                      }
                      return 'Seçim Yapılmadı'; // Seçim yapılmadıysa bu mesajı göster
                    }}
                  >
                    {urunKategoriler.map((kategori) => (
                      <MenuItem key={kategori.id} value={kategori.id}>
                        {kategori.baslik} {/* Kategori başlığını göster */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>


                <FormControl fullWidth margin="normal">
                    <InputLabel shrink htmlFor="vitrin-select" style={{ marginBottom: '8px', marginTop: '-10px' }}>Vitrin</InputLabel>
                    <Select
                         displayEmpty
                         value={selectedVitrin.id || ''}
                         onChange={(e) => {
                             const selectedVitrinData = urunVitrin.find(kategori => kategori.id === e.target.value);
                             setSelectedVitrin(selectedVitrinData || { id: '', baslik: '' });
                         }}
                         inputProps={{ 'aria-label': 'Without label' }}
                         renderValue={
                             selected => !selected ? <>Seçim Yapılmadı</> : selectedVitrin.baslik || 'Bulunamadı'
                         }
                         id="vitrin-select"
                     >
                         <MenuItem value="">
                             <>Seçim Yapılmadı</>
                         </MenuItem>
                         {urunVitrin.map((kategori) => (
                             <MenuItem key={kategori.id} value={kategori.id}>
                                 {kategori.baslik}
                             </MenuItem>
                         ))}
                    </Select>
                </FormControl>




                <FormControlLabel control={<Checkbox checked={selectedItem ? selectedItem.durum : false} onChange={(e) => setSelectedItem({ ...selectedItem, durum: e.target.checked })} />} label="Aktif" />
              </DialogContent>
              {saveError && <p style={{ color: 'red', marginLeft: '25px' }}>{saveError}</p>}
              {uyariMesaji && <p style={{ color: 'red', marginLeft: '25px' }}>{uyariMesaji}</p>}

              <DialogActions>
                  <Button onClick={() => handleSave(selectedItem,selectedVitrin,selectedKategori)} color="primary" disabled={isSaving}>
                    {isSaving ? <CircularProgress size={24} /> : "Kaydet"}
                  </Button>
              </DialogActions>
            </>
          )}
      </Dialog>


      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="sm">
      <DialogTitle>
        Yeni Ekle
        <IconButton
            onClick={handleCloseAddDialog}
            style={{ position: 'absolute', right: 8, top: 8 }}
        >
            <CloseIcon />
        </IconButton>
      
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Başlık"
          value={newItem.baslik}
          onChange={(e) => setNewItem({ ...newItem, baslik: e.target.value })}
          fullWidth
          margin="normal"
        />



         <div style={{ textAlign: 'center', marginBottom: '20px' , marginTop:'20px' }}>
          <div style={{ border: '2px dashed grey', width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          {!newItem.kapakFotografi ? (
            <>
             <Typography variant="subtitle1" style={{ marginBottom: '10px', position: 'absolute', top: 0, left: 10 }}>
               Kapak Fotoğrafı:
             </Typography>
            <label htmlFor="kapak_fotografiInput">
              <IconButton
                style={{ fontSize: '50px', color: 'green' }}
                component="span"
              >
                <AddPhotoAlternateIcon />
              </IconButton>
            </label>
            </>
          ) : (
            <>
                <Typography variant="subtitle1" style={{ marginBottom: '10px', position: 'absolute', top: 0, left: 10 }}>
                    Kapak Fotoğrafı:
                </Typography>
                
                    <img
                        src={newItem.kapakFotografi}
                        alt="Kapak Fotoğrafı"
                        style={{ maxWidth: '50%', maxHeight: '100px', position: 'relative' }}
                    />
                    <IconButton
                        onClick={() => handleRemoveImageEkle('kapakFotografi')}
                        style={{ fontSize: '20px', backgroundColor: 'transparent', color: 'red', position: 'absolute', top: 0, right: 0 }}
                    >
                        <CloseIcon />
                    </IconButton>
                
            </>

          )}
          </div>
        </div>
        <input
          type="file"
          id="kapak_fotografiInput"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileChangeEkle(e, "kapakFotografi")}
        />


        <TextField
        label="Fiyat"
        value={newItem.fiyat || ''}
        onChange={(e) => {
            const value = e.target.value;
            // Kullanıcının yalnızca sayı ve bir ondalık nokta girmesini sağla
            // ve iki ondalık basamağa kadar izin ver
            const matched = value.match(/^\d*(\.\d{0,2})?$/);

            // Eşleşme varsa yeni değeri güncelle
            if (matched) {
            setNewItem({ ...newItem, fiyat: value });
            }
        }}
        fullWidth
        margin="normal"
        InputProps={{
            endAdornment: <InputAdornment position="end">TL</InputAdornment>,
        }}
        />


           {/* editor ekleme */}
        
        {newItem && (
              <>
                <Typography variant="subtitle1" style={{ marginBottom: '10px', marginTop:'10px'}}>
                  Açıklama (isteğe bağlı):
                </Typography>
                <TextEditorTipTap selectedItem={newItem} setSelectedItem={setNewItem}/>
              </>
            )}



        {/* Görsel Galerisi */}
        <div style={{ border: '2px dashed grey', margin: '20px 0', overflowX: 'auto', height: '300px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <Typography variant="subtitle1" style={{ marginBottom: '10px', position: 'absolute', top: 0, left: 10 }}>
                    Galeri:
                </Typography>
                <div style={{ 
                    display: 'flex',
                    gap: '20px', // Öğeler arasındaki boşluk
                    alignItems: 'center', 
                    paddingLeft: imagesCount <= 2 ? 0 : "40px", 
                    minWidth: imagesCount <= 2 ? 'fit-content' : '100%' 
                }}>

                    <div>
                        {/* Gizli Dosya Input */}
                        <input
                            type="file"
                            id="imageInput"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(e)=>handleFileAlbum(e)}
                        />

                        {/* Görsel Ekleme Butonunu Çevreleyen Stil */}
                        <div style={{ border: '2px dashed grey', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '120px', height: '150px'}}>
                            <label htmlFor="imageInput">
                            <IconButton
                                style={{ color: 'green' }} // Yeşil renkli ikon
                                component="span"
                            >
                                <AddPhotoAlternateIcon />
                            </IconButton>
                            </label>
                        </div>
                    </div>


                    {/* createImageAlbum'dan Gelen Görseller */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {createImageAlbum.length > 0 && [...createImageAlbum].reverse().map((item, index) => (
                        <div key={index} style={{ border: '2px dashed grey', padding: '5px', width: '120px', height: '150px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={item.frontFile} alt={`Albüm Görseli ${index}`} style={{ maxWidth: '100px', height: 'auto', maxHeight: '80px' }} />
                            {/* Kapatma (Silme) İkonu */}
                            <IconButton onClick={() => imgCreateAlbumRemove(index)} style={{ position: 'absolute', top: 0, right: 0, color: 'red' }}>
                            <CloseIcon />
                            </IconButton>
                        </div>
                        ))}
                    </div>
                    
                </div>
                
            </div>


            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" gutterBottom style={{ marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', color: '#555' }}>Bedenler</Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    {bedenler.map((beden, index) => (
                        <div key={index} style={{ 
                            flex: '0 1 calc(33.3333% - 20px)',
                            marginBottom: '10px',
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '10px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={beden.durum}
                                        onChange={() => handleCheckboxChange(index)}
                                        style={{ padding: '0 10px' }}
                                    />
                                }
                                label={beden.numara}
                            />
                            {/* Buraya istediğiniz ekstra içerik veya mesaj ekleyebilirsiniz */}
                        </div>
                    ))}
                </div>
            </div>


            <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" gutterBottom style={{ marginBottom: '15px', textAlign: 'center', fontWeight: 'bold', color: '#555' }}>Özellikler</Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                    {ozellikler.map((ozellik, index) => (
                        <div key={index} style={{ 
                            flex: '0 1 calc(33.3333% - 20px)',
                            marginBottom: '10px',
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '10px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={ozellik.durum}
                                        onChange={() => handleOzellikCheckboxChange(index)}
                                        style={{ padding: '0 10px' }}
                                    />
                                }
                                label={ozellik.name}
                            />
                            {/* Buraya istediğiniz ekstra içerik veya mesaj ekleyebilirsiniz */}
                        </div>
                    ))}
                </div>
            </div>


            <FormControl fullWidth margin="normal">
              <InputLabel style={{ marginBottom: '8px', marginTop: '-10px' }}>
                Kategori
              </InputLabel>
              <Select
                value={selectedKategori?.id || ''} // Ensure the value is always defined
                onChange={(e) => {
                  const selected = urunKategoriler.find(
                    (kategori) => kategori.id === e.target.value
                  );
                  setSelectedKategori(selected || {}); // Set the selected category object
                }}
                renderValue={(selected) => {
                  const kategori = urunKategoriler.find((kategori) => kategori.id === selected);
                  return kategori ? kategori.baslik : 'Seçim Yapılmadı'; // Display category title or default message
                }}
              >
                {urunKategoriler.map((kategori) => (
                  <MenuItem key={kategori.id} value={kategori.id}>
                    {kategori.baslik} {/* Display category title */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>



            <FormControl fullWidth margin="normal">
                <InputLabel shrink htmlFor="vitrin-select" style={{ marginBottom: '8px', marginTop: '-10px' }}>
                  Vitrin
                </InputLabel>
                <Select
                  displayEmpty
                  value={selectedVitrin?.id || ''} // Eğer selectedVitrin varsa id değerini göster, yoksa boş bırak
                  onChange={(e) => {
                    const selected = urunVitrin.find((kategori) => kategori.id === e.target.value);
                    setSelectedVitrin(selected || {}); // Seçilen vitrini obje olarak kaydet
                  }}
                  inputProps={{ 'aria-label': 'Without label' }}
                  renderValue={(selected) => {
                    if (!selected) return <>Seçim Yapılmadı</>; // Eğer seçim yapılmamışsa
                    const kategori = urunVitrin.find((k) => k.id === selected);
                    return kategori ? kategori.baslik : 'Bulunamadı'; // Seçilen başlık ya da 'Bulunamadı'
                  }}
                  id="vitrin-select"
                >
                  <MenuItem value="">
                    <>Seçim Yapılmadı</>
                  </MenuItem>
                  {urunVitrin.map((kategori) => (
                    <MenuItem key={kategori.id} value={kategori.id}>
                      {kategori.baslik} {/* Vitrin başlığını göster */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>






        <FormControlLabel
          control={<Checkbox checked={newItem.durum || false} onChange={(e) => setNewItem({ ...newItem, durum: e.target.checked })} />}
          label="Aktif"
        />
      </DialogContent>

      {uyariMesajiEkle && <p style={{ color: 'red', marginLeft: '25px' }}>{uyariMesajiEkle}</p>}
      {saveError && <p style={{ color: 'red', marginLeft: '25px' }}>{saveError}</p>}

        <DialogActions>
          <Button onClick={()=>{handleAddNewItem(selectedKategori,selectedVitrin)}} color="primary" disabled={isSaving}>
            {isSaving ? <CircularProgress size={24} /> : "Ekle"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography>Seçili öğeleri silmek istediğinizden emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="primary">
            İPTAL
          </Button>
          <Button onClick={handleConfirmDelete} color="primary" autoFocus>
            SİL
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={warningDialogOpen}
        onClose={handleCloseWarningDialog}
      >
        <DialogTitle>Uyarı</DialogTitle>
        <DialogContent>
          <Typography>Silmek için önce bir öğe seçmelisiniz.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWarningDialog} color="primary">
            Tamam
          </Button>
        </DialogActions>
      </Dialog>
      
    </>

        </>
    )
}