
import React, { useState, useEffect } from 'react';
import SurguluBanner from '../compenent/SurguluBanner'
import Head from 'next/head';
import AnaSayfaKategori from '@/compenent/AnaSayfaKategori';
import Vitrin from '@/compenent/Vitrin';


function Index() {


  return (
    <>
    <Head>
      <title>Rose İş Güvenliği Ekipmanları</title>
      <meta name="description" content="Rose İş Güvenliği Ekipmanları, iş güvenliği sektöründe toptan satış ile hizmet veriyor. Geniş ürün yelpazesi ve kaliteli ekipmanlarla iş güvenliğinizi sağlıyoruz." />
      <link rel="icon" href="/rose-logo-08.png" type="image/png" />
    </Head>

    <SurguluBanner/>
    <AnaSayfaKategori/>
    <Vitrin/>
    </>
  );
}

export default Index;
