/**
 * synonyms.js — B2B Türkiye Arama Sinonim Haritası
 * Her grup, birbiriyle eşanlamlı / ilişkili terimleri içerir.
 * Kullanıcı gruptan herhangi bir terimi aradığında gruptaki tüm terimler DB'de aranır.
 */

const SYNONYM_GROUPS = [

  // ═══════════════════════════════════════════════════════
  // METAL & ÇELİK
  // ═══════════════════════════════════════════════════════
  ['çelik', 'steel', 'demir çelik', 'çelik üretim'],
  ['paslanmaz', 'paslanmaz çelik', 'inox', 'stainless', 'ss304', 'ss316', 'ss'],
  ['alüminyum', 'aluminyum', 'aluminum', 'aluminium', 'al alaşım', 'alüminyum profil'],
  ['bakır', 'copper', 'elektrolitik bakır', 'bakır tel', 'bakır boru'],
  ['pirinç', 'brass', 'sarı maden', 'pirinç çubuk'],
  ['bronz', 'bronze', 'kalay bakır'],
  ['galvaniz', 'galvanizli', 'çinko kaplı', 'hot dip galvaniz', 'DKP', 'sıcak daldırma'],
  ['titanyum', 'titanium', 'ti alaşım'],
  ['dökme demir', 'cast iron', 'pik demir', 'sfero döküm', 'gri döküm'],
  ['nikel', 'nickel', 'ni alaşım', 'inconel', 'monel'],
  ['çinko', 'zinc', 'zn'],
  ['kalay', 'tin', 'sn', 'lehim'],
  ['magnezyum', 'magnesium', 'mg alaşım'],
  ['alaşım', 'alloy', 'metal alaşım', 'özel alaşım'],

  // SAC, PROFİL, YARI MAMUL
  ['sac', 'levha', 'plaka', 'sheet metal', 'metal levha', 'çelik sac', 'aluminyum sac'],
  ['profil', 'çelik profil', 'yapı profili', 'profil çeliği'],
  ['köşebent', 'L profil', 'angle iron', 'eşit kenarlı köşebent'],
  ['HEA', 'HEB', 'IPE', 'IPN', 'geniş başlıklı', 'I profil', 'H profil', 'kiriş'],
  ['kutu profil', 'RHS', 'SHS', 'kare kutu', 'dikdörtgen kutu', 'kutu çelik'],
  ['lama', 'düz çelik', 'flat bar', 'şerit çelik'],
  ['boru', 'tüp', 'pipe', 'tube', 'çelik boru', 'dikişli boru', 'dikişsiz boru', 'seamless'],
  ['tel', 'filmaşin', 'çelik tel', 'çekme tel', 'paslanmaz tel', 'örgü tel'],
  ['çubuk', 'bar', 'yuvarlak çelik', 'round bar', 'kare çubuk', 'altıgen çubuk'],
  ['bant çelik', 'strip', 'rulo', 'coil', 'çelik rulo', 'soğuk hadde rulo'],

  // ═══════════════════════════════════════════════════════
  // MAKİNE & İMALAT
  // ═══════════════════════════════════════════════════════
  ['cnc', 'cnc işleme', 'talaşlı imalat', 'işleme merkezi', 'cnc freze', 'cnc torna', 'machining'],
  ['freze', 'frezeleme', 'milling', 'freze makinesi', 'yatay freze', 'dikey freze'],
  ['torna', 'tornalama', 'turning', 'torna tezgahı', 'universal torna'],
  ['lazer kesim', 'lazer', 'laser cutting', 'lazer kesme', 'fiber lazer', 'co2 lazer'],
  ['plazma', 'plazma kesim', 'plasma cutting', 'plazma tezgah'],
  ['su jeti', 'waterjet', 'water jet', 'su jet kesim'],
  ['pres', 'pres bükme', 'bükme', 'abkant', 'sac bükme', 'press brake'],
  ['kaynak', 'welding', 'MIG', 'TIG', 'kaynak makinesi', 'argon kaynak', 'elektrik kaynağı', 'özlü tel', 'tig kaynak', 'mig kaynak', 'spot kaynak'],
  ['döküm', 'casting', 'metal döküm', 'alüminyum döküm', 'çelik döküm', 'basınçlı döküm', 'kum döküm', 'hassas döküm'],
  ['hadde', 'haddeleme', 'soğuk hadde', 'sıcak hadde', 'rolling', 'hadde hattı'],
  ['ekstrüzyon', 'extrusion', 'profil çekme', 'aluminyum ekstrüzyon'],
  ['enjeksiyon', 'injection molding', 'plastik enjeksiyon', 'kalıp', 'plastik kalıp'],
  ['sinter', 'sinterleme', 'toz metalurjisi', 'powder metallurgy'],
  ['ısıl işlem', 'sertleştirme', 'tavlama', 'nitrürleme', 'sementasyon', 'temperleme', 'heat treatment'],
  ['yüzey işlem', 'kaplama', 'nikel kaplama', 'krom kaplama', 'anodizasyon', 'fosfatlama', 'elektroplating', 'surface treatment'],
  ['toz boya', 'elektrostatik boya', 'powder coating', 'fırın boya'],
  ['dişleme', 'klavuz', 'pafta', 'kılavuz çekme', 'diş açma', 'threading'],
  ['taşlama', 'grinding', 'silindirik taşlama', 'yüzey taşlama', 'rectifying'],
  ['delik delme', 'matkap', 'delik delme işlemi', 'drilling', 'delme'],
  ['çekme', 'tel çekme', 'soğuk çekme', 'drawing'],
  ['iş makinesi', 'ekskavatör', 'beko loder', 'dozer', 'greyder', 'kazıcı yükleyici', 'kepçe'],

  // MAKİNE ELEMANLARI
  ['rulman', 'bilyalı rulman', 'makaralı rulman', 'bearing', 'rulman yatağı'],
  ['dişli', 'dişli kutusu', 'redüktör', 'gearbox', 'şanzıman', 'devir azaltıcı', 'reducer'],
  ['zincir', 'güç aktarma zinciri', 'chain', 'zincir dişlisi'],
  ['kayış', 'v kayış', 'v belt', 'kasnak', 'belt', 'triger kayış', 'timing belt'],
  ['kaplin', 'kavrama', 'coupling', 'flanş', 'flange'],
  ['conta', 'salmastra', 'gasket', 'seal', 'o-ring', 'orink', 'keçe'],
  ['bağlantı elemanı', 'cıvata', 'somun', 'vida', 'rondela', 'perçin', 'bolt', 'nut', 'fastener', 'sabitleme elemanı'],
  ['yay', 'spiral yay', 'basma yayı', 'çekme yayı', 'spring'],
  ['mil', 'aks', 'shaft', 'step mili', 'krank mili'],
  ['kasnaklar', 'pully', 'makara', 'kasnak'],
  ['kesici takım', 'freze takımı', 'uç', 'insert', 'cutting tool', 'karbür uç', 'matkap ucu'],
  ['aşındırıcı', 'zımpara', 'taşlama diski', 'abrasive', 'zımpara kağıdı', 'zımpara bezi', 'aşındırıcı disk'],
  ['hidrolik', 'hidrolik silindir', 'hidrolik pompa', 'hidrolik valf', 'hydraulic'],
  ['pnömatik', 'pnömatik silindir', 'hava pistonu', 'pneumatic', 'hava tahrikli'],
  ['konveyör', 'bant konveyör', 'zincirli konveyör', 'taşıma bandı', 'conveyor', 'band conveyor'],
  ['vinç', 'kren', 'crane', 'köprülü vinç', 'mobil vinç', 'elektrikli vinç', 'palanga'],

  // ═══════════════════════════════════════════════════════
  // ELEKTRİK & ELEKTRONİK
  // ═══════════════════════════════════════════════════════
  ['kablo', 'enerji kablosu', 'bakır kablo', 'NYY', 'NYAF', 'NYM', 'NAYY', 'KVV', 'iletken'],
  ['trafo', 'transformatör', 'transformer', 'alçaltıcı trafo', 'güç trafosu', 'dağıtım trafosu'],
  ['motor', 'elektrik motoru', 'asenkron motor', 'servo motor', 'step motor', 'ac motor', 'dc motor'],
  ['jeneratör', 'dizel jeneratör', 'generator', 'güç üreteci', 'akım üreteci'],
  ['ups', 'kesintisiz güç', 'UPS sistemi', 'uninterruptible power', 'güç kaynağı'],
  ['invertör', 'inverter', 'frekans dönüştürücü', 'VFD', 'hız sürücüsü', 'frekans kontrol', 'sürücü'],
  ['pano', 'elektrik panosu', 'enerji panosu', 'dağıtım panosu', 'MCC', 'kontrol panosu', 'AG pano', 'OG pano'],
  ['sigorta', 'otomatik sigorta', 'MCB', 'MCCB', 'kesici', 'şalter', 'circuit breaker', 'devre kesici'],
  ['kompanzasyon', 'reaktif güç kompanzasyon', 'kondansatör', 'kapasitör', 'kapasitor', 'güç faktörü'],
  ['aydınlatma', 'LED', 'armatür', 'led armatür', 'projektör', 'floresan', 'ampul', 'lamba', 'spot ışık', 'sokak lambası'],
  ['röle', 'kontaktör', 'kontaktor', 'relay', 'termik röle', 'zaman rölesi'],
  ['sensör', 'endüktif sensör', 'kapasitif sensör', 'fotoelektrik sensör', 'enkoder', 'encoder', 'dönüştürücü', 'transmitter'],
  ['PLC', 'otomasyon', 'SCADA', 'HMI', 'endüstriyel otomasyon', 'kontrol sistemi', 'programlanabilir'],
  ['topraklama', 'parafudr', 'lightning rod', 'yıldırım koruma', 'toprak hattı'],
  ['kablo kanalı', 'kablo taşıyıcı', 'kablo merdiveni', 'kablo raf', 'cable tray'],
  ['priz', 'şuko priz', 'endüstriyel priz', 'fiş', 'konnektör', 'connector'],
  ['akü', 'batarya', 'akümülatör', 'battery', 'lityum batarya', 'lityum', 'lithium'],
  ['güneş', 'solar', 'güneş paneli', 'fotovoltaik', 'PV panel', 'güneş enerjisi'],
  ['şarj istasyonu', 'ev şarjı', 'wallbox', 'EV şarj', 'elektrikli araç şarj'],

  // ═══════════════════════════════════════════════════════
  // HVAC & TESİSAT
  // ═══════════════════════════════════════════════════════
  ['hvac', 'iklimlendirme', 'havalandırma', 'ısıtma soğutma', 'air conditioning', 'klima sistemi'],
  ['klima', 'split klima', 'VRF', 'VRV', 'multi split', 'kaset tipi klima', 'merkezi klima'],
  ['chiller', 'su soğutma', 'soğutma grubu', 'chiller ünite', 'hava soğutmalı chiller'],
  ['fan coil', 'fancoil', 'fan-coil', 'FC ünite', 'kanal tipi fan coil'],
  ['kalorifer', 'radyatör', 'petek', 'panel radyatör', 'çelik radyatör'],
  ['kombi', 'kazan', 'boiler', 'ısı merkezi', 'merkezi ısıtma sistemi', 'kombikombisi'],
  ['ısı pompası', 'heat pump', 'ısı geri kazanımı', 'HRV', 'ERV'],
  ['hava kanalı', 'kanal sistemi', 'duct', 'flexible kanal', 'menfez', 'diffüzör', 'grille', 'hava dağıtım'],
  ['vana', 'valf', 'valve', 'küresel vana', 'kelebek vana', 'çek valf', 'geri dönüşsüz valf', 'baskı düşürücü valf'],
  ['pompa', 'sirkülasyon pompası', 'drenaj pompası', 'pis su pompası', 'pump', 'dalgıç pompa', 'santrifüj pompa'],
  ['kompresör', 'hava kompresörü', 'compressor', 'pistonlu kompresör', 'vidalı kompresör'],
  ['baca', 'duman baca sistemi', 'baca kanalı', 'duman tahliye', 'baca bacası'],
  ['su arıtma', 'arıtma sistemi', 'RO sistemi', 'osmoz', 'softener', 'sertlik giderme', 'deiyonize su'],
  ['boru izolasyon', 'köpük boru', 'armaflex', 'kaowool', 'mineral yün boru', 'kauçuk izolasyon'],
  ['fanlar', 'aksiyel fan', 'santrifüj fan', 'egzoz fanı', 'havalandırma fanı', 'fan'],
  ['soğutma kulesi', 'cooling tower', 'su soğutma kulesi'],

  // ═══════════════════════════════════════════════════════
  // İNŞAAT & YAPI MALZEMESİ
  // ═══════════════════════════════════════════════════════
  ['beton', 'hazır beton', 'prefabrik', 'brüt beton', 'C25', 'C30', 'betonarme'],
  ['çimento', 'cement', 'portland çimento', 'CEM I', 'CEM II', 'harç bağlayıcı'],
  ['tuğla', 'briket', 'bims blok', 'ytong', 'gazbeton', 'AAC', 'delikli tuğla'],
  ['yalıtım', 'ısı yalıtımı', 'ses yalıtımı', 'taşyünü', 'cam yünü', 'XPS', 'EPS', 'strafor', 'rockwool'],
  ['su yalıtımı', 'membran', 'bitüm', 'bitümlü membran', 'waterproofing', 'izolasyon membranı', 'şap membranı'],
  ['çatı', 'sandviç panel çatı', 'trapez sac', 'çatı paneli', 'çatı kiremiti', 'kiremit', 'arduvaz çatı'],
  ['cephe', 'cephe kaplama', 'kompozit panel', 'alüminyum kompozit', 'ACP', 'giydirme cephe', 'EIFS'],
  ['cam', 'çift cam', 'ısıcam', 'temperli cam', 'güvenlik camı', 'float cam', 'lamine cam', 'reflekte cam'],
  ['doğrama', 'alüminyum doğrama', 'PVC doğrama', 'kapı pencere', 'sürme kapı', 'çelik kapı'],
  ['yapı kimyasalı', 'yapıştırıcı', 'katkı maddesi', 'beton katkı', 'admixture', 'poliüretan köpük', 'silikon mastik'],
  ['zemin kaplama', 'fayans', 'seramik', 'mermer', 'granit parke', 'laminat parke', 'ahşap parke', 'epoksi zemin'],
  ['boya inşaat', 'duvar boyası', 'dış cephe boyası', 'astar', 'epoksi zemin boyası'],
  ['iskele', 'scaffolding', 'iskelesi', 'çelik iskele'],
  ['kalıp', 'çelik kalıp', 'formwork', 'beton kalıbı', 'plastik kalıp inşaat'],
  ['çelik konstrüksiyon', 'çelik yapı', 'steel structure', 'prefabrik yapı', 'çelik çerçeve', 'çelik çatı'],
  ['asansör', 'elevator', 'lift', 'yürüyen merdiven', 'escalator', 'yük asansörü'],
  ['demir donatı', 'inşaat demiri', 'nervürlü çelik', 'rebär', 'inşaat hasırı'],

  // ═══════════════════════════════════════════════════════
  // KİMYA & PLASTİK
  // ═══════════════════════════════════════════════════════
  ['polimer', 'plastik hammadde', 'polimer hammadde', 'resin hammadde'],
  ['polietilen', 'PE', 'HDPE', 'LDPE', 'LLDPE', 'polyethylene'],
  ['polipropilen', 'PP', 'polipropilen granül', 'polypropylene'],
  ['PVC', 'polivinil klorür', 'polivinil', 'vinil', 'pvc boru', 'pvc profil', 'pvc film'],
  ['ABS', 'akrilonitril', 'abs granül', 'abs plastik'],
  ['polikarbonат', 'PC', 'policarbonat', 'lexan', 'makrolon'],
  ['naylon', 'poliamid', 'PA', 'PA6', 'PA66', 'nylon'],
  ['PET', 'polietilen tereftalat', 'PET granül', 'PET şişe hammaddesi'],
  ['PMMA', 'akrilik', 'pleksiglas', 'organik cam', 'şeffaf plastik'],
  ['granül', 'masterbatch', 'plastik granül', 'pigment masterbatch'],
  ['epoksi', 'epoxy reçine', 'epoksi sistem', 'reçine', 'epoksi yapıştırıcı'],
  ['poliüretan', 'PU', 'polyurethane', 'pu köpük', 'sünger', 'pu dolgu', 'sert köpük', 'yumuşak köpük'],
  ['silikon', 'silicone', 'silikon kauçuk', 'elastomer', 'rtvsilikon'],
  ['kauçuk', 'rubber', 'doğal kauçuk', 'SBR', 'EPDM', 'NBR', 'lateks', 'kauçuk profil', 'kauçuk conta'],
  ['solvent', 'tiner', 'aseton', 'MEK', 'IPA', 'izopropanol', 'çözücü', 'thinner'],
  ['asit', 'sülfürik asit', 'H2SO4', 'hidroklorik asit', 'HCl', 'nitrik asit', 'fosforik asit'],
  ['alkali', 'kostik', 'soda', 'NaOH', 'KOH', 'amonyak'],
  ['deterjan', 'temizlik kimyasalı', 'surfaktan', 'yüzey aktif madde', 'temizleyici'],
  ['yağlayıcı', 'endüstriyel yağ', 'gres', 'makine yağı', 'lubricant', 'yağlama yağı', 'kesme sıvısı'],
  ['boya kimya', 'pigment', 'vernik', 'coating', 'astar kimya', 'epoksi boya'],
  ['yapıştırıcı kimya', 'tutkal', 'adhesive', 'kleo', 'poliüretan yapıştırıcı'],
  ['köpük', 'köpük hammaddesi', 'polyol', 'izosiyant', 'MDI', 'TDI'],

  // ═══════════════════════════════════════════════════════
  // TEKSTİL & HAZIR GİYİM
  // ═══════════════════════════════════════════════════════
  ['pamuk', 'cotton', 'pamuklu', 'ham pamuk', 'elyaf'],
  ['polyester', 'PES', 'sentetik fiber', 'polyester iplik', 'PET fiber'],
  ['viskon', 'viscose', 'rayon', 'modal'],
  ['iplik', 'yarn', 'thread', 'ham iplik', 'boyalı iplik', 'riş iplik', 'eğirme'],
  ['kumaş', 'dokuma kumaş', 'fabric', 'tekstil kumaşı', 'metraj kumaş'],
  ['örme', 'triko', 'trikotaj', 'knitting', 'jakarlı', 'süprem', 'interlok', 'rib'],
  ['konfeksiyon', 'hazır giyim', 'garment', 'dikiş', 'imalat konfeksiyon'],
  ['tekstil boyama', 'boyahane', 'apre', 'terbiye', 'finishing', 'baskı terbiye'],
  ['denim', 'kot kumaş', 'jean kumaşı', 'indigo boyalı'],
  ['teknik tekstil', 'nonwoven', 'dokusuz kumaş', 'geotekstil', 'filtre kumaş'],
  ['nakış', 'embroidery', 'nakış ipliği'],
  ['fermuvar', 'baskı düğme', 'olta', 'rivet', 'zımpara düğme', 'aksesuar tekstil'],
  ['neopren', 'dalış elbisesi kumaşı', 'neoprene'],
  ['polar', 'fleece', 'polar kumaş', 'mikrofleece'],
  ['iş elbisesi', 'iş giysisi', 'tulum', 'reflektif yelek', 'koruyucu giysi'],

  // ═══════════════════════════════════════════════════════
  // GIDA & TARIM
  // ═══════════════════════════════════════════════════════
  ['buğday', 'un', 'tahıl', 'hububat', 'kepek', 'irmik'],
  ['mısır', 'mısır unu', 'mısır nişastası', 'corn'],
  ['arpa', 'yulaf', 'çavdar', 'barlı', 'malt'],
  ['bakliyat', 'mercimek', 'fasulye', 'nohut', 'bezelye', 'bakla'],
  ['yemeklik yağ', 'ayçiçek yağı', 'zeytinyağı', 'bitkisel yağ', 'rafine yağ', 'margarin'],
  ['şeker', 'nişasta', 'glikoz', 'fruktoz', 'sukroz', 'tatlandırıcı'],
  ['süt ürünleri', 'süt', 'peynir', 'tereyağı', 'yoğurt', 'krema', 'uf peyniri'],
  ['et ürünleri', 'tavuk', 'kanatlı', 'sığır eti', 'kırmızı et', 'balık'],
  ['gıda ambalaj', 'gıda kutusu', 'gıda torbası', 'vakum ambalaj', 'MAP ambalaj'],
  ['baharat', 'kuru baharat', 'spice', 'öğütülmüş baharat'],
  ['katkı maddesi', 'gıda katkı', 'emülgatör', 'koruyucu madde', 'renklendirici gıda'],
  ['tarım ilacı', 'pestisit', 'herbisit', 'fungisit', 'insektisit'],
  ['gübre', 'fertilizer', 'kimyasal gübre', 'organik gübre', 'NPK', 'üre gübresi'],
  ['tohum', 'hibrit tohum', 'fide', 'fidan', 'tarımsal üretim'],
  ['soğuk depo', 'soğuk hava', 'cold storage', 'dondurulmuş depo', 'frigorifik'],

  // ═══════════════════════════════════════════════════════
  // OTOMOTİV
  // ═══════════════════════════════════════════════════════
  ['yedek parça', 'otomotiv parça', 'spare part', 'oem parça', 'yedek parça üretimi'],
  ['lastik', 'tyre', 'tire', 'araç lastiği', 'ticari araç lastiği', 'off road lastik'],
  ['fren', 'fren balatası', 'fren diski', 'brake pad', 'brake disc'],
  ['egzoz', 'susturucu', 'exhaust', 'egzoz borusu', 'katalitik'],
  ['filtre otomotiv', 'yağ filtresi', 'hava filtresi', 'yakıt filtresi', 'kabin filtresi'],
  ['amortisör', 'süspansiyon', 'viraj takımı', 'shock absorber'],
  ['kaporta', 'karoseri parçası', 'camlık', 'tampon'],
  ['far', 'sis lambası', 'stop lambası', 'araç aydınlatma', 'led far'],
  ['jant', 'kaster', 'wheel rim', 'çelik jant', 'alüminyum jant'],
  ['elektrik otomotiv', 'akü otomotiv', 'ateşleme', 'marş motoru', 'alternatör otomotiv'],
  ['klima otomotiv', 'kompresör otomotiv', 'kondansör otomotiv', 'ac otomotiv'],
  ['yağ madeni', 'motor yağı', 'şanzıman yağı', 'diferansiyel yağı', 'otomotiv yağı'],

  // ═══════════════════════════════════════════════════════
  // LOJİSTİK & DEPOLAMA
  // ═══════════════════════════════════════════════════════
  ['nakliye', 'taşımacılık', 'lojistik', 'sevkiyat', 'freight', 'kargo', 'yük taşıma'],
  ['depolama', 'antrepo', 'depo hizmet', 'warehouse', 'WMS', 'lojistik depo'],
  ['forklift', 'istif makinesi', 'reach truck', 'transpalet', 'elektrikli forklift'],
  ['raf sistemi', 'paletli raf', 'palet reyonu', 'depo rafı', 'shelving system', 'cantilever raf'],
  ['palet', 'ahşap palet', 'plastik palet', 'euro palet', 'pallet'],
  ['ambar', 'arşiv depo', 'açık alan depo', 'saha depo'],

  // ═══════════════════════════════════════════════════════
  // AMBALAJ
  // ═══════════════════════════════════════════════════════
  ['karton', 'oluklu karton', 'karton kutu', 'koli', 'corrugated', 'karton ambalaj'],
  ['naylon torba', 'polietilen torba', 'poşet', 'plastik torba', 'şeffaf torba'],
  ['shrink film', 'shrink', 'streç film', 'stretch film', 'koli sargı'],
  ['buble wrap', 'kabarcıklı naylon', 'bubble wrap', 'balonlu naylon'],
  ['etiket', 'label', 'barkod etiketi', 'termal etiket', 'sticker'],
  ['ambalaj makinesi', 'paketleme makinesi', 'dolum makinesi', 'shrink makinesi', 'bantlama makinesi'],
  ['cam şişe', 'cam ambalaj', 'kavanoz', 'cam konserve'],
  ['plastik şişe', 'PET şişe', 'HDPE şişe', 'bidon'],
  ['alüminyum folyo', 'folyo ambalaj', 'flexible ambalaj', 'laminat film', 'alüminyum kap'],
  ['ahşap sandık', 'kafes sandık', 'crate', 'wooden box'],
  ['köpük ambalaj', 'strafor ambalaj', 'eps ambalaj', 'pu ambalaj'],
  ['bigpak', 'bigbag', 'dökme torba', 'FIBC', 'jumbo torba', 'ton torba'],

  // ═══════════════════════════════════════════════════════
  // MOBİLYA & AHŞAP
  // ═══════════════════════════════════════════════════════
  ['ahşap', 'odun', 'kereste', 'lumber', 'timber', 'kesilmiş ahşap'],
  ['mobilya', 'furniture', 'ofis mobilyası', 'ev mobilyası', 'oturma grubu'],
  ['MDF', 'sunta', 'yonga levha', 'HDF', 'lam levha'],
  ['kontrplak', 'plywood', 'kontra levha', 'OSB'],
  ['laminat', 'laminat kaplama', 'melamin kaplama', 'HPL'],
  ['masif', 'masif ahşap', 'solid wood', 'masif parke'],
  ['pvc kaplama', 'ahşap kaplama profil', 'PVC band', 'kenar bandı'],
  ['ağaç fidanı', 'orman fidanı', 'ağaç üretim'],

  // ═══════════════════════════════════════════════════════
  // ENERJİ
  // ═══════════════════════════════════════════════════════
  ['rüzgar', 'rüzgar türbini', 'wind energy', 'türbin', 'rüzgar enerjisi'],
  ['doğalgaz', 'LNG', 'LPG', 'sıvılaştırılmış gaz', 'gaz yakıtı'],
  ['akaryakıt', 'fuel', 'mazot', 'motorin', 'petrol', 'gazyağı'],
  ['enerji depolama', 'enerji depo sistemi', 'BESS', 'grid enerji depo'],
  ['trafo merkezi', 'enerji nakil', 'iletim hattı', 'elektrik şebekesi'],
  ['biyokütle', 'biyogaz', 'biyoenerji', 'atık bertaraf enerji'],
  ['hidroelektrik', 'su gücü', 'HES', 'mini HES'],

  // ═══════════════════════════════════════════════════════
  // IT & TEKNOLOJİ
  // ═══════════════════════════════════════════════════════
  ['yazılım', 'software', 'ERP', 'CRM', 'MES', 'endüstriyel yazılım'],
  ['donanım', 'hardware', 'sunucu', 'server', 'bilgisayar donanım'],
  ['ağ', 'network', 'switch', 'router', 'firewall', 'WiFi', 'ağ altyapı'],
  ['kamera', 'güvenlik kamera', 'CCTV', 'IP kamera', 'PTZ kamera', 'gözetleme'],
  ['baskı', 'printer', 'yazıcı', 'plotter', 'barkod yazıcı', 'etiket yazıcı'],
  ['depo yönetim', 'WMS', 'stok takip', 'envanter', 'barkod sistemi'],

  // ═══════════════════════════════════════════════════════
  // SAĞLIK, İŞ GÜVENLİĞİ & MEDİKAL
  // ═══════════════════════════════════════════════════════
  ['medikal', 'tıbbi cihaz', 'sağlık ekipmanı', 'medical device', 'hastane ekipmanı'],
  ['ilaç', 'farmasötik', 'pharmaceutical', 'aktif farmasötik'],
  ['iş güvenliği', 'KKD', 'koruyucu ekipman', 'PPE', 'kişisel koruyucu'],
  ['baret', 'kask', 'hard hat', 'koruyucu kask', 'güvenlik kaskı'],
  ['eldiven', 'iş eldiveni', 'nitril eldiven', 'latex eldiven', 'koruyucu eldiven'],
  ['ayakkabı iş', 'iş ayakkabısı', 'çelik burun', 'safety shoes', 'koruyucu ayakkabı'],
  ['yüz siperi', 'güvenlik gözlüğü', 'face shield', 'göz koruma'],
  ['sterilizasyon', 'dezenfektan', 'antiseptik', 'biyosit'],
  ['yangın', 'yangın söndürücü', 'sprinkler', 'yangın alarm', 'fire protection'],

  // ═══════════════════════════════════════════════════════
  // ÖLÇÜM & TEST
  // ═══════════════════════════════════════════════════════
  ['ölçüm cihazı', 'ölçüm aleti', 'kalibrasyon', 'metroloji', 'enstrümantasyon'],
  ['tartı', 'baskül', 'terazi', 'bant terazisi', 'scale'],
  ['titreşim', 'vibrasyon', 'vibration meter', 'ivme ölçer'],
  ['sıcaklık ölçüm', 'termometre', 'thermocouple', 'termokupl', 'RTD', 'PT100'],
  ['basınç ölçüm', 'manometre', 'basınç transmitteri', 'pressure gauge'],
  ['akış ölçüm', 'debi ölçer', 'flowmeter', 'ultrasonic flow'],
  ['tahribatsız muayene', 'NDT', 'ultrasonik test', 'magnetic particle', 'penetrant test'],
  ['test cihazı', 'çekme test', 'basma test', 'malzeme test', 'tensile test'],

  // ═══════════════════════════════════════════════════════
  // ÇEVRE & ATIK
  // ═══════════════════════════════════════════════════════
  ['atık su', 'arıtma tesisi', 'wwtp', 'biyolojik arıtma', 'kimyasal arıtma'],
  ['hava kirliliği', 'filtre toz', 'toz tutma', 'filtre sistemi', 'baca filtresi', 'elektrostatik filtre'],
  ['geri dönüşüm', 'atık geri kazanım', 'hurda', 'hurdacı', 'ikincil hammadde'],
  ['atık yönetim', 'atık bertaraf', 'çevre danışmanlık'],

];

// ─── Eşleştirme Fonksiyonu ───────────────────────────────────────────────────

/**
 * Kullanıcı sorgusunu sinonim gruplarıyla genişlet.
 * @param {string} query - Kullanıcının aradığı metin
 * @returns {string[]} - DB'de aranacak terimler dizisi (orijinal dahil, maks. 15)
 */
export function expandSearchTerms(query) {
  const lq = (query || '').toLocaleLowerCase('tr').trim();
  if (lq.length < 2) return [lq];

  const terms = new Set([lq]);

  for (const group of SYNONYM_GROUPS) {
    const matched = group.some(term => {
      const lt = term.toLocaleLowerCase('tr');
      if (lt === lq) return true;
      // En az 3 karakter olan terimler için kısmi eşleşme
      if (lq.length >= 3 && lt.includes(lq)) return true;
      if (lt.length >= 3 && lq.includes(lt)) return true;
      return false;
    });

    if (matched) {
      group.forEach(term => terms.add(term.toLocaleLowerCase('tr')));
    }
  }

  // Sorgu uzunluğunu makul tut (15 terim yeterli)
  return [...terms].slice(0, 15);
}

// Enes Doğanay | 2 Mayıs 2026: Levenshtein mesafesi — yazım hatası tespiti için edit distance hesabı
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Enes Doğanay | 2 Mayıs 2026: Tüm sinonim terimlerinin düzleştirilmiş listesi — öneri sözlüğü
const ALL_TERMS = [...new Set(SYNONYM_GROUPS.flat().map(t => t.toLocaleLowerCase('tr')))];

/**
 * Enes Doğanay | 2 Mayıs 2026: Kullanıcının yazdığı sorguya en yakın terimi önerir.
 * Yalnızca 0 sonuç durumunda çağır.
 * @returns {string|null} Öneri terimi veya null (öneri yoksa)
 */
export function suggestCorrection(query) {
  const lq = (query || '').toLocaleLowerCase('tr').trim();
  if (lq.length < 2) return null;

  // Zaten tam eşleşme varsa öneri gerekmez
  if (ALL_TERMS.includes(lq)) return null;

  let best = null;
  let bestDist = Infinity;
  const maxDist = Math.max(2, Math.floor(lq.length / 3)); // uzun kelimelere daha toleranslı

  for (const term of ALL_TERMS) {
    // Çok farklı uzunluktaki terimleri atla (hız için)
    if (Math.abs(term.length - lq.length) > maxDist + 1) continue;
    const d = levenshtein(lq, term);
    if (d < bestDist && d <= maxDist) {
      bestDist = d;
      best = term;
    }
  }

  return best;
}

export default SYNONYM_GROUPS;
