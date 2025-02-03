import styles from '../styles/CustomFooter.module.css';
import { API_ROUTES } from '../utils/constants';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebook,
  faTwitter,
  faInstagram,
  faLinkedin,
  faYoutube,
  faTiktok
} from '@fortawesome/free-brands-svg-icons'; 

const getIcon = (url) => {
  if (url.includes('x.com')) return faTwitter;
  if (url.includes('instagram.com')) return faInstagram;
  if (url.includes('facebook.com')) return faFacebook;
  if (url.includes('linkedin.com')) return faLinkedin;
  if (url.includes('youtube.com')) return faYoutube;
  if (url.includes('tiktok.com')) return faTiktok;
  return null;
};


const Footer = () => {
  const [socialMedia, setSocialMedia] = useState([]);
  const [hizliLinkler, setHizliLinkler] = useState([]);
  const [iletisim, setIletisim] = useState({});

  const getSocialData = async () => {
    try {
      const response = await axios.get(API_ROUTES.MEDYA_DETAIL);
      const result = response.data;
      const socialMediaData = [];

      if (result.twitter) socialMediaData.push({ id: 'twitter', url: result.twitter });
      if (result.instagram) socialMediaData.push({ id: 'instagram', url: result.instagram });
      if (result.facebook) socialMediaData.push({ id: 'facebook', url: result.facebook });
      if (result.youtube) socialMediaData.push({ id: 'youtube', url: result.youtube });
      if (result.linkedin) socialMediaData.push({ id: 'linkedin', url: result.linkedin });
      if (result.tiktok) socialMediaData.push({ id: 'tiktok', url: result.tiktok });

      setSocialMedia(socialMediaData); // Verileri state'e kaydet
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    }
  };

  useEffect(() => {
    getSocialData();
  }, []);

  useEffect(() => {
    const fetchHizliLinkler = async () => {
      try {
        const response = await axios.get(API_ROUTES.HIZLI_LINKLER_ACTIVE);
        setHizliLinkler(response.data);
      } catch (error) {
        console.error('Hızlı linkler bilgileri yüklenirken bir hata oluştu:', error);
      }
    };

    fetchHizliLinkler();
  }, []);

  useEffect(() => {
    const fetchIletisim = async () => {
      try {
        const response = await axios.get(API_ROUTES.ILETISIM.replace("id", 1));
        setIletisim(response.data);
      } catch (error) {
        console.error('İletişim bilgileri yüklenirken bir hata oluştu:', error);
      }
    };

    fetchIletisim();
  }, []);

  return (
    <footer className={styles.customFooter}>
      <div className={styles.footerContent}>
        <div className={`${styles.footerSection} ${styles.rightCizgi}`}>
          <h3>İletişim</h3>
          <p>Adres: {iletisim.address}</p>
          <p>Email: <a href={`mailto:${iletisim.email}`}>{iletisim.email}</a></p>
          <p>Telefon: {iletisim.phone1} / {iletisim.phone2}</p>
        </div>

        <div className={`${styles.footerSection} ${styles.rightCizgi}`}>
          <h3>Hızlı Linkler</h3>
          <ul>
            {hizliLinkler.map(link => (
              <li key={link.id}>
                <Link href={link.url}>
                  <div>{link.name}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Sosyal Medya</h3>
          <div className={styles.socialIcons}>
            {socialMedia.map(media => (
              <a key={media.id} href={media.url} target="_blank" rel="noopener noreferrer" className={styles.iconLink}>
                <FontAwesomeIcon icon={getIcon(media.url)} className={styles.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; 2025 FlexSoft</p>
      </div>
    </footer>
  );
};

export default Footer;


