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

  // ═══════════════════════════════════════════════════════
  // Enes Doğanay | 2 Mayıs 2026: ÜRÜN TİPLERİ & VARYANTLAR
  // ═══════════════════════════════════════════════════════

  // POMPALAR — ürün tipleri
  ['santrifüj pompa', 'merkezi pompa', 'centrifugal pump', 'volüt pompa', 'tek kademeli pompa', 'çok kademeli pompa', 'in-line pompa', 'end suction pompa'],
  ['dalgıç pompa', 'submersible pump', 'derin kuyu pompası', 'drenaj dalgıç', 'pis su dalgıç pompası', 'kuyu pompası'],
  ['dişli pompa', 'gear pump', 'loblu pompa', 'lob pompa', 'dişli çark pompa', 'döner dişli pompa'],
  ['peristaltik pompa', 'hortum pompası', 'peristaltic pump', 'tüplü pompa', 'hose pump'],
  ['pistonlu pompa', 'piston pump', 'alternatif pompa', 'krank pompa', 'plunger pompa'],
  ['membran pompa', 'diyafram pompa', 'diaphragm pump', 'hava tahrikli membran pompa', 'AODD pompa', 'çift diyaframlı pompa'],
  ['vida pompası', 'vidalı pompa', 'screw pump', 'tek vidalı pompa', 'çift vidalı pompa', 'mono pompa'],
  ['vakum pompası', 'vacuum pump', 'halkalı vakum pompası', 'kuru vakum pompası', 'oil-free vakum', 'sıvı halkalı pompa'],
  ['dozaj pompası', 'dozlama pompası', 'metering pump', 'dozajlama pompası', 'kimyasal dozaj', 'peristaltik dozaj'],
  ['pompaj istasyonu', 'buster pompa', 'hidrofor', 'hidrofor seti', 'basınç artırma seti', 'hidrofor grubu'],

  // VANALAR — ürün tipleri
  ['küresel vana', 'ball valve', 'tam delikli küresel vana', 'v port küresel vana', 'trunnion ball valve', 'floating ball valve'],
  ['kelebek vana', 'butterfly valve', 'diskli vana', 'flanşlı kelebek vana', 'wafer tip kelebek vana', 'double offset butterfly', 'triple offset butterfly'],
  ['sürgülü vana', 'gate valve', 'kama vana', 'paralel disk vana', 'sluice valve', 'lineer hareket vana'],
  ['çek valf', 'check valve', 'geri dönüş vanası', 'non-return valve', 'salınımlı çek valf', 'lift check valve', 'wafer check valve'],
  ['globe vana', 'stop vana', 'kontrol vanası', 'düz akışlı vana', 'globe valve', 'needle globe'],
  ['iğne vana', 'needle valve', 'ince ayar vanası', 'mikrodoz vanası', 'strangulation valve'],
  ['basınç düşürücü vana', 'PRV', 'regülatör vana', 'pressure reducing valve', 'basınç kontrol vanası', 'balanslama vanası'],
  ['emniyet valfi', 'güvenlik vanası', 'safety valve', 'relief valve', 'tahliye valfi', 'spring loaded safety valve'],
  ['solenoid vana', 'elektro vana', 'solenoid valve', 'elektromanyetik vana', 'NC solenoid', 'NO solenoid', '2/2 solenoid', '3/2 solenoid'],
  ['bileziksiz vana', 'bellow seal valve', 'körük sızdırmazlıklı vana', 'sızdırmaz vana'],
  ['termostatik vana', 'termostat vanası', 'thermostatic valve', 'radyatör vanası', 'ısı kontrol vanası'],
  ['3 yollu vana', 'üç yollu vana', '3-way valve', 'mixing valve', 'karıştırma vanası', 'bölücü vana', 'diverting valve'],
  ['pnömatik aktüatörlü vana', 'motorlu vana', 'actuated valve', 'elektromotorlu vana', 'kontrol vanası aktüatörlü'],

  // KOMPRESÖRLER — ürün tipleri
  ['pistonlu kompresör', 'reciprocating compressor', 'alternatif kompresör', 'tek kademeli piston kompresör', 'çift kademeli piston kompresör', 'tankli kompresör'],
  ['vidalı kompresör', 'screw compressor', 'rotary screw compressor', 'yağlı vidalı kompresör', 'yağsız vidalı kompresör', 'oil-free screw compressor'],
  ['scroll kompresör', 'scroll compressor', 'spiral kompresör', 'hermetik scroll'],
  ['santrifüj kompresör', 'centrifugal compressor', 'turbo kompresör', 'dinamik kompresör', 'turbo blower'],
  ['diyafram kompresör', 'membran kompresör', 'diaphragm compressor', 'yüksek basınç diyafram kompresör'],
  ['hava tankı', 'basınçlı hava tankı', 'kompresör tankı', 'alıcı tank', 'receiver tank', 'hava deposu'],
  ['hava kurutucu', 'refrigerant dryer', 'adsorpsiyon kurutucu', 'nem alıcı hava', 'hava filtre kurutucu', 'desiccant dryer'],
  ['hava filtresi kompresör', 'filtre regülatör', 'FRL grubu', 'filtre regülatör yağlayıcı', 'FRL set'],

  // FİLTRELER — ürün tipleri
  ['torba filtre', 'bag filter', 'filtre torbası', 'pulse jet torba filtre', 'jet pulse bag filter', 'toz toplama torba filtre'],
  ['kartuş filtre', 'cartridge filter', 'katlanmış kartuş', 'membran kartuş', 'pleated cartridge', 'endüstriyel kartuş'],
  ['kum filtresi', 'sand filter', 'kuvars kum filtresi', 'hızlı kum filtresi', 'yavaş kum filtresi'],
  ['aktif karbon filtresi', 'karbon filtre', 'aktif kömür filtresi', 'koku giderme filtresi', 'GAC filtresi'],
  ['HEPA filtre', 'mutlak filtre', 'yüksek verimli filtre', 'temiz oda filtresi', 'H13 filtre', 'H14 filtre', 'ULPA filtre'],
  ['separator', 'siklonlu separator', 'santrifüj separator', 'yağ su separator', 'mist separator', 'sis filtresi'],
  ['coalescer', 'birleştirici filtre', 'yağ tutucu filtre', 'mist eliminator', 'sıvı koaleser'],
  ['panel filtre', 'hava panel filtresi', 'G4 filtre', 'F7 filtre', 'F9 filtre', 'EU4 filtre', 'EU7 filtre'],
  ['sıvı filtresi', 'Y tipi filtre', 'basket filtre', 'duplex filtre', 'otomatik temizlemeli filtre', 'self cleaning filter'],
  ['membran filtresi', 'UF membran', 'NF membran', 'RO membranı', 'mikrofiltrasyon membranı', 'ultrafiltrasyon'],

  // ISI EŞANJÖRÜ — ürün tipleri
  ['plakalı eşanjör', 'plate heat exchanger', 'PHE', 'lehimli plakalı eşanjör', 'gevşek plakalı eşanjör', 'brazed plate heat exchanger'],
  ['borulu ısı eşanjörü', 'shell and tube heat exchanger', 'kabuk boru eşanjör', 'boru demeti eşanjör', 'double pipe heat exchanger'],
  ['sarmal eşanjör', 'spiral heat exchanger', 'helikal eşanjör', 'wort chiller'],
  ['kanatçıklı eşanjör', 'fin tube heat exchanger', 'finli boru eşanjör', 'yüzgeçli eşanjör', 'air cooled heat exchanger'],
  ['plaka soğutucu', 'su soğutucu eşanjör', 'gıda eşanjör', 'süt eşanjör', 'içecek eşanjör'],

  // TANKLAR VE DEPOLAR — ürün tipleri
  ['paslanmaz tank', 'inox tank', 'paslanmaz depo', 'gıda tankı', 'kimyasal depolama tankı', 'AISI 304 tank', 'AISI 316 tank'],
  ['polyester tank', 'GRP tank', 'cam elyaf tank', 'fiberglass tank', 'FRP tank', 'cam takviyeli polyester tank'],
  ['PE tank', 'polietilen tank', 'polietilen depo', 'hdpe tank', 'polietilen su deposu', 'plastik depo'],
  ['silobas', 'silo', 'konik silobas', 'kuru silo', 'toz silo', 'metal silo', 'tahıl silosu', 'çimento silosu'],
  ['IBC tank', 'hazır kap', 'konteyner kap', 'ara yığın konteyner', '1000 lt konteyner'],
  ['basınçlı kap', 'pressure vessel', 'basınç tankı', 'otoklav tank', 'ASME tankı', 'PED basınçlı kap'],
  ['yakıt tankı', 'mazot tankı', 'dizel yakıt deposu', 'çelik yakıt tankı', 'yeraltı yakıt tankı', 'üst zemin yakıt tankı'],

  // KLİMA & HVAC ÜRÜNLER
  ['split klima', 'inverter klima', 'duvar tipi klima', 'eko inverter', 'A++ klima', 'monoblok klima'],
  ['kaset klima', 'kaset tipi klima', 'dörtlü kaset klima', 'ikili kaset klima', 'slim kaset klima'],
  ['kanal tipi klima', 'ducted klima', 'kanallı klima', 'kanal tipi ünite', 'yüksek statik kanallı klima'],
  ['VRF sistemi', 'VRV sistemi', 'multi split sistem', 'çoklu iç ünite sistemi', 'heat recovery VRF'],
  ['AHU', 'klima santrali', 'hava işleme ünitesi', 'air handling unit', 'havalandırma santrali', 'rooftop AHU'],
  ['FCU', 'fan coil ünitesi', 'fan coil', 'fancoil', 'yatay FCU', 'dikey FCU', 'standart FCU', 'kanal FCU'],
  ['chiller', 'su soğutma grubu', 'hava soğutmalı chiller', 'su soğutmalı chiller', 'absorbsiyonlu chiller', 'manyetik yataklı chiller'],
  ['soğuk oda', 'cold room', 'şok dondurma odası', 'pozitif soğuk oda', 'negatif soğuk oda', 'derin dondurucu oda'],
  ['hava perdesi', 'air curtain', 'hava corteni', 'ısıtmalı hava perdesi', 'endüstriyel hava perdesi'],
  ['radyant ısıtıcı', 'infrared ısıtıcı', 'gaz radyant', 'elektrik radyant', 'tüplü radyant ısıtıcı'],

  // ELEKTRİK ÜRÜNLER — tipler
  ['güç kaynağı', 'SMPS', 'switch mode güç kaynağı', 'DC güç kaynağı', 'DIN ray güç kaynağı', 'power supply', '24V DC güç kaynağı', '48V DC güç kaynağı'],
  ['otomatik sigorta', 'MCB', 'C eğrisi sigorta', 'B eğrisi sigorta', 'D eğrisi sigorta', 'bipolar sigorta', 'tripolar sigorta'],
  ['artık akım koruma', 'RCCB', 'RCD', 'kaçak akım koruma', 'RCBO', '30mA RCD', 'diferansiyel şalter'],
  ['kontaktör', 'AC kontaktör', 'DC kontaktör', 'güç kontaktörü', 'motor kontaktörü', 'kapasitör kontaktörü'],
  ['termik röle', 'bimetalik röle', 'aşırı yük rölesi', 'thermal overload relay', 'elektronik aşırı yük rölesi'],
  ['zaman rölesi', 'timer röle', 'on-delay röle', 'off-delay röle', 'dijital zaman rölesi', 'çok fonksiyonlu zaman rölesi'],
  ['yumuşak yolvericisi', 'soft starter', 'yumuşak start', 'motorlu yumuşak yolvericisi', 'elektronik yolvericisi'],
  ['motor koruma şalteri', 'motor circuit breaker', 'motor devre kesici', 'kompakt devre kesici'],
  ['busbar', 'bara', 'bakır bara', 'alüminyum bara', 'bara sistemi', 'bara dağıtım', 'busbar trunking'],
  ['enerji analizörü', 'güç analizörü', 'power analyzer', 'şebeke analizörü', 'enerji ölçer', 'power quality analyzer'],
  ['yıldırım koruma', 'parafudr', 'SPD', 'surge protector', 'aşırı gerilim koruma', 'lightning arrester'],
  ['izolasyon trafısı', 'medikal trafo', 'tıbbi izolasyon trafosu', 'IT sistemleri trafosu'],

  // OTOMASYON & KONTROL — ürün tipleri
  ['PLC modülü', 'CPU modül', 'I/O modül', 'dijital giriş modülü', 'analog giriş modülü', 'PLC kartı', 'remote I/O'],
  ['HMI panel', 'dokunmatik panel', 'operatör paneli', 'HMI ekran', 'endüstriyel dokunmatik ekran', 'SCADA panel'],
  ['servo sürücü', 'servo kontrol', 'servo amplifikatör', 'servo drive', 'servo sistemi', 'AC servo sürücü'],
  ['step motor sürücü', 'step driver', 'adım motor sürücüsü', 'stepper controller'],
  ['endüktif sensör', 'manyetik sensör', 'proximity switch', 'yakınlık sensörü', 'flush sensör', 'non-flush sensör'],
  ['optik sensör', 'fotoelektrik sensör', 'lazer sensör', 'bariyer sensör', 'yansımalı sensör', 'diffuse sensör'],
  ['ultrasonik sensör', 'mesafe sensörü', 'seviye sensörü', 'ultrasonic level sensor', 'ultrasonic distance sensor'],
  ['basınç sensörü', 'basınç transmitteri', 'manometrik sensör', 'pressure transmitter', 'diferansiyel basınç transmitteri'],
  ['sıcaklık sensörü', 'PT100', 'termokupl tip K', 'termokupl tip J', 'NTC sensör', 'temperature sensor', 'RTD sensör'],
  ['akış sensörü', 'flow switch', 'manyetik akış ölçer', 'kütlesel akış ölçer', 'vortex flowmeter', 'turbine flowmeter'],
  ['enkoder', 'rotary encoder', 'lineer enkoder', 'artımlı enkoder', 'mutlak enkoder', 'hollow shaft encoder'],
  ['limit switch', 'son durak şalteri', 'mikro switch', 'pozisyon sensörü', 'roller limit switch'],
  ['RFID okuyucu', 'barkod tarayıcı', 'QR okuyucu', 'endüstriyel barkod', '2D barkod', 'vision sensör'],

  // BORU & TESİSAT BAĞLANTI ELEMANLARI
  ['PPRC boru', 'polipropilen boru', 'PP-R boru', 'PPR boru', 'ısıtma PPR borusu', 'sıcak su PPR borusu', 'PN20 PPR', 'PN10 PPR'],
  ['PEX boru', 'çapraz bağlı polietilen boru', 'PEX-A boru', 'PEX-B boru', 'esnek boru', 'yerden ısıtma borusu'],
  ['HDPE boru', 'PE100 boru', 'PE80 boru', 'polietilen basınç borusu', 'PE içme suyu borusu', 'PN6 PE', 'PN16 PE'],
  ['spiral çelik boru', 'kaynaklı spiral boru', 'SSAW boru', 'büyük çap çelik boru', 'ERW boru', 'LSAW boru'],
  ['drenaj borusu', 'pis su borusu', 'PVC drenaj', 'yağmur suyu borusu', 'atık su borusu', 'üç kat boru'],
  ['bakır boru', 'sert bakır boru', 'yarı sert bakır boru', 'yumuşak bakır', 'ACR bakır boru', 'klima bakır borusu'],
  ['çelik flanş', 'weld neck flanş', 'slip on flanş', 'blind flanş', 'kör flanş', 'ANSI B16.5 flanş', 'PN16 flanş', 'PN40 flanş'],
  ['dirsek boru', '90 derece dirsek', '45 derece dirsek', 'elbow', 'kaynaklı dirsek', 'vidalı dirsek', 'geçişli dirsek'],
  ['te parçası', 'tee fitting', 'T bağlantı', 'eşit te', 'redüksiyonlu te', 'vidalı te', 'kaynaklı te'],
  ['redüksiyon fitting', 'konik redüksiyon', 'konsantrik redüksiyon', 'eksentrik redüksiyon', 'boru indirgeyici'],
  ['manşon', 'boru manşonu', 'sleeve coupling', 'birleştirici manşon', 'kompansatör', 'esnek boru bağlantısı'],
  ['nipel', 'boru nipeli', 'uzatma nipeli', 'çift dış dişli', 'iç-dış dişli nipel'],
  ['kompansatör', 'ekspansiyon kompansatörü', 'bükümlü kompansatör', 'aksiyel kompansatör', 'yanal kompansatör', 'metal bellows'],

  // MAKİNE ALETLERİ & EL ALETLERİ — ürün tipleri
  ['açı taşlama', 'avuç taşlama', 'angle grinder', '115mm taşlama', '125mm taşlama', '230mm taşlama'],
  ['elektrikli matkap', 'şarjlı matkap', 'darbeli matkap', 'kırıcı delici', 'SDS plus matkap', 'SDS max matkap', 'kargabumu'],
  ['vidalama makinesi', 'akülü tornavida', 'şarjlı tornavida', 'çift hızlı matkap', 'darbeli tornavida'],
  ['tork anahtarı', 'dinamometrik anahtar', 'torque wrench', 'tork tabancası', 'dijital tork anahtarı'],
  ['pnömatik tabanca', 'hava tabancası', 'darbe anahtarı', 'air impact wrench', 'pnömatik tornavida'],
  ['hidrolik kriko', 'şişe kriko', 'makas kriko', 'hydraulic jack', 'döşeme krikosu'],
  ['lehim aleti', 'kaynak torcu', 'propan torcu', 'asetilenli kaynak seti', 'mig kaynak makinesi tüketimleri'],
  ['bant testere', 'metal kesim testeresi', 'daire testere', 'şerit testere', 'ahşap testere makinesi'],
  ['zımpara makinesi', 'bant zımpara', 'diskli zımpara', 'titreşimli zımpara', 'random orbital zımpara'],
  ['pres vida', 'mengene', 'tabla mengenesi', 'tezgah mengenesi', 'bench vise'],
  ['ölçüm aleti', 'dijital kumpas', 'mikrometre', 'komparatör', 'açı ölçer', 'dijital seviye göstergesi', 'lazer seviye cihazı'],

  // VİNÇ & KALDIRMA EKİPMANLARI — ürün tipleri
  ['köprülü vinç', 'overhead crane', 'tek kirişli köprülü vinç', 'çift kirişli köprülü vinç', 'portal vinç', 'gantry crane'],
  ['konsol vinç', 'jib crane', 'döner vinç', 'duvar tipi vinç', 'sabit konsol vinç', 'zemin konsollu vinç'],
  ['zincirli palanga', 'zincirli vinç', 'chain hoist', 'elektrikli palanga', 'manuel palanga', 'monoraylı palanga'],
  ['halatli vinç', 'wire rope hoist', 'çelik halatlı vinç', 'tek halatlı vinç', 'çift halatlı vinç'],
  ['transpalet', 'el transpaleti', 'elektrikli transpalet', 'hand pallet truck', 'motorlu transpalet', 'yüksek kaldırmalı transpalet'],
  ['istif makinesi', 'reach truck', 'counterbalance forklift', 'order picker', 'çekici araç', 'çekici forklift'],

  // KONVEYÖR — ürün tipleri
  ['bant konveyör', 'belt conveyor', 'lastik bantlı konveyör', 'düz bant konveyör', 'yükseltici bant konveyör', 'moduler bant konveyör'],
  ['makaralı konveyör', 'roller conveyor', 'rulolu konveyör', 'çekilmeli makaralı', 'motorlu makaralı konveyör'],
  ['vidalı konveyör', 'helezon konveyör', 'screw conveyor', 'spiral konveyör', 'toz taşıyıcı helezon'],
  ['titreşimli konveyör', 'vibrasyon konveyör', 'rezonans konveyör', 'shaker konveyör'],
  ['zincirli konveyör', 'chain conveyor', 'traction chain conveyor', 'scraper conveyor', 'apron konveyör'],
  ['pnömatik taşıma', 'pneumatic conveying', 'vakumlu taşıma', 'basınçlı taşıma', 'dense phase', 'dilute phase'],

  // ÇELİK YAPI & ÇATI ÜRÜNLER
  ['sandviç panel', 'çatı sandviç paneli', 'cephe sandviç paneli', 'PUR sandviç panel', 'PIR sandviç panel', 'EPS sandviç panel', 'rockwool sandviç panel'],
  ['trapez sac', 'trapez profil', 'oluklu sac', 'çatı trapez sacı', 'cephe trapez sacı', 'galvanizli trapez', 'T35 trapez', 'T50 trapez'],
  ['Z purlin', 'C purlin', 'çatı aşığı', 'aşık', 'çatı mertekleri', 'galvanizli aşık', 'soğuk hadde aşık'],
  ['çelik kolon', 'kolon profili', 'HEA kolon', 'HEB kolon', 'kutu profil kolon', 'kafes kolon'],
  ['çelik kiriş', 'ana kiriş', 'çatı kirişi', 'I kiriş', 'H kiriş', 'kafes kiriş', 'makaslar'],
  ['döşeme sacı', 'composition deck', 'corrugated deck', 'çelik döşeme sacı', 'betonarme için döşeme sacı'],
  ['grating', 'çelik ızgara', 'platform ızgarası', 'yürüme platformu sacı', 'steel grating', 'servis platformu sacı'],

  // OTOMOTİV ÜRÜNLER — tipler
  ['motor yağı', 'SAE 5W30', 'SAE 10W40', 'SAE 15W40', 'tam sentetik motor yağı', 'yarı sentetik motor yağı', 'mineral motor yağı'],
  ['akü araç', '12V akü', '24V akü', 'kuru akü', 'bakımsız akü', 'AGM akü', 'EFB akü', 'gel akü', 'stop-start akü'],
  ['antifriz', 'soğutma suyu', 'coolant', 'glikol bazlı antifriz', 'organik OAT antifriz', 'hazır karışım antifriz'],
  ['silecek', 'ön cam sileceği', 'flat silecek', 'beam silecek', 'hybrid silecek', 'arka silecek'],
  ['fren balatası', 'ön balata', 'arka balata', 'disk balata', 'pabuç balata', 'semi metalik balata', 'seramik balata'],
  ['ateşleme bujisi', 'buji', 'spark plug', 'iridyum buji', 'platin buji', 'çift elektrotlu buji'],
  ['transmisyon sıvısı', 'otomatik şanzıman yağı', 'ATF', 'DSG yağı', 'CVT yağı', 'manuel şanzıman yağı'],
  ['diferansiyel yağı', 'arka aks yağı', 'gear oil', 'SAE 80W90', 'SAE 75W90', 'GL-5 yağı'],

  // AMBALAJ ÜRÜNLER — tipler
  ['vakum torbası', 'vakum poşet', 'vakum ambalaj torbası', 'bariyer torba', 'PA/PE vakum', 'cook-in torba'],
  ['standart karton kutu', 'RSC kutu', 'çift oluklu karton', 'tek oluklu karton', 'mikro oluklu karton', 'nakliye karton kutusu'],
  ['streç film', 'makine steci', 'el steci', 'stretch wrap', 'palet sargı filmi', 'cast stretch film'],
  ['termal etiket', 'direkt termal etiket', 'termal transfer etiket', 'barkod etiketi', 'endüstriyel termal etiket'],
  ['buble wrap', 'kabarcıklı naylon rulo', 'small bubble wrap', 'large bubble wrap', 'anti-statik bubble wrap'],
  ['PP çember bant', 'PET çember bant', 'çemberleme bandı', 'çember bant', 'çemberleme aksesuarı', 'çemberleme makinesi'],
  ['akıllı etiket', 'RFID etiket', 'NFC etiket', 'elektronik etiket', 'smart label'],
  ['köpük ambalaj', 'strafor ambalaj', 'EPS köpük ambalaj', 'PE köpük ambalaj', 'pu köpük ambalaj', 'şekillendirilmiş köpük'],
  ['alüminyum kap', 'alüminyum folyo kap', 'alüminyum tepsi', 'gastronorm alüminyum', 'food tray'],

  // MOBİLYA & İÇ MEKAN
  ['kapı', 'iç kapı', 'ahşap iç kapı', 'amerikan kapı', 'laminat kapı', 'masif kapı', 'ateş kapısı', 'duman kapısı'],
  ['dolap', 'ankastre dolap', 'gardırop', 'ofis dolabı', 'arşiv dolabı', 'metal kasa', 'kilitli dolap'],
  ['masa', 'çalışma masası', 'toplantı masası', 'ofis masası', 'bilgisayar masası', 'yükseklik ayarlı masa'],
  ['sandalye', 'ofis sandalyesi', 'ergonomik sandalye', 'yönetici koltuğu', 'misafir sandalyesi', 'bekleme koltuğu'],
  ['raf sistemi', 'depo rafı', 'paletli raf', 'konsol raf', 'cantilever raf', 'küçük parça rafı', 'arabalı raf'],
  ['perde', 'stor perde', 'zebra perde', 'dikey perde', 'güneşlik perde', 'blackout perde', 'roller blind'],

  // MEDIKAL & LABORATuvar ÜRÜNLER
  ['muayene eldiveni', 'nitril muayene eldiveni', 'latex muayene eldiveni', 'vinil muayene eldiveni', 'pudrasız eldiven'],
  ['laboratuvar ekipmanı', 'analitik terazi', 'hassas terazi', 'pipet', 'mikropipet', 'beher', 'erlenmayer balonu', 'cam malzeme lab'],
  ['otoklav', 'sterilizatör', 'buhar sterilizatörü', 'kuru ısı sterilizatörü', 'UV sterilizatör'],
  ['tanı cihazı', 'biyokimya analizörü', 'kan sayım cihazı', 'PCR cihazı', 'immunoassay analizörü', 'idrar analizörü'],
  ['ilaç ambalajı', 'blister ambalaj', 'ilaç şişesi', 'amber şişe', 'ilaç tüpü', 'çocuklara güvenli kapak'],

  // BİNA ELEKTRİK TESİSATI
  ['LED armatür', 'led panel armatür', 'led tüp armatür', 'led downlight', 'highbay armatür', 'floodlight armatür', 'sokak armatürü'],
  ['buton ve anahtar', 'endüstriyel buton', 'acil stop butonu', 'aydınlatmalı buton', 'selector switch', 'cam altı buton'],
  ['kablo kanalı', 'plastik kablo kanalı', 'metal kablo kanalı', 'PVC kablo kanalı', 'kablo oluk', 'kablo kanalı kapağı'],
  ['dağıtım kutusu', 'buat', 'junction box', 'branşman kutusu', 'pano kutusu', 'elektrik dağıtım kutusu'],
  ['koruge boru', 'esnek elektrik borusu', 'PVC elektrik borusu', 'kablo borusu', 'esnek tesisat borusu'],
  ['topraklama elektrodu', 'bakır topraklama çubuğu', 'topraklama barası', 'earth rod', 'toprak iletkeni'],

  // GÜVENLIK & YANGIN
  ['kuru kimyevi toz söndürücü', 'CO2 yangın söndürücü', 'köpüklü söndürücü', 'yangın söndürücü tüp', '6 kg söndürücü', '12 kg söndürücü'],
  ['sprinkler başlığı', 'deluge sprinkler', 'pre-action sprinkler', 'wet pipe sprinkler', 'gizli tip sprinkler'],
  ['yangın alarm paneli', 'yangın algılama sistemi', 'duman dedektörü', 'ısı dedektörü', 'alev dedektörü', 'adresli yangın paneli'],
  ['acil aydınlatma', 'exit işareti', 'kaçış yolu armatürü', 'emergency luminaire', 'akülü acil armatür'],
  ['güvenlik kamerası', 'IP kamera', 'dome kamera', 'bullet kamera', 'PTZ kamera', 'fisheye kamera', '4K güvenlik kamerası'],
  ['geçiş kontrol', 'turnike', 'bariyer', 'full beden turnike', 'tripod turnike', 'kartlı geçiş sistemi'],
  ['alarm sistemi', 'hırsız alarm', 'hareket sensörü', 'PIR dedektör', 'manyetik kontak', 'dokunma dedektörü'],

  // İŞ GÜVENLİĞİ KİŞİSEL KORUYUCU DONANIM
  ['baret', 'koruyucu kask', 'ABS baret', 'HDPE baret', 'elektrikli işler bareti', 'yansıtıcılı baret'],
  ['eldiven', 'iş eldiveni', 'nitril eldiven', 'latex eldiven', 'mekanik risk eldiveni', 'kesilme önleyici eldiven', 'kaynakçı eldiveni'],
  ['iş ayakkabısı', 'çelik burun ayakkabı', 'safety shoes', 'kompozit burunlu ayakkabı', 'su geçirmez iş botu', 'anti-statik ayakkabı'],
  ['yüz siperi', 'güvenlik gözlüğü', 'face shield', 'polisaj gözlüğü', 'toz gözlüğü', 'kaynak maskesi'],
  ['solunum koruyucu', 'toz maskesi', 'FFP1 maske', 'FFP2 maske', 'FFP3 maske', 'yarım yüz maskesi', 'tam yüz maskesi'],
  ['yüksekte çalışma', 'paraşüt tipi emniyet kemeri', 'emniyet kemeri', 'lanyard', 'fall arrest', 'bağlama halatı'],
  ['koruyucu kıyafet', 'tyvek tulum', 'atex giysi', 'high-vis yelek', 'reflektif tulum', 'kimyasal koruma elbisesi'],
  ['kulak koruyucu', 'kulaklık', 'tıkaç', 'ear plug', 'ear muff', 'SNR kulak koruyucu'],

  // GENEL SANAYİ ÜRÜNLER
  ['endüstriyel raf', 'çelik raf', 'depo raf sistemi', 'yük rafı', 'orta yük rafı', 'ağır yük rafı'],
  ['endüstriyel merdiven', 'çelik merdiven', 'alüminyum merdiven', 'sabit platform merdiveni', 'seyyar merdiven', 'vinç merdiveni'],
  ['korkuluk', 'çelik korkuluk', 'paslanmaz korkuluk', 'alüminyum korkuluk', 'endüstriyel barikat', 'bariyer korkuluk'],
  ['zemin kaplama endüstriyel', 'epoksi zemin kaplama', 'pu zemin kaplama', 'poliüretan zemin', 'antistatic zemin', 'aşınmaya dayanıklı zemin'],
  ['endüstriyel zemin ızgarası', 'platform ızgarası', 'galvanizli ızgara', 'paslanmaz ızgara', 'FRP ızgara'],
  ['boya tabancası', 'sprey tabancası', 'airless boya tabancası', 'HVLP tabanca', 'elektrostatik boya tabancası'],

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
