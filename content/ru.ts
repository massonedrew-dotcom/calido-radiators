/**
 * Russian copy — the default locale. Every headline and body string here is
 * lifted verbatim from the source story slides; only navigation labels, the
 * form and the legal line are new writing.
 */
export const ru = {
  locale: 'ru',
  htmlLang: 'ru-RU',
  alternate: { href: '/en', label: 'EN', title: 'English' },

  brand: {
    name: 'Calido',
    full: 'Calido Radiators',
    tagline: 'Тепло, которому доверяют',
  },

  nav: {
    label: 'Основная навигация',
    skip: 'Перейти к содержимому',
    items: [
      { id: 'about', label: 'О заводе' },
      { id: 'technology', label: 'Технология' },
      { id: 'range', label: 'Модельный ряд' },
      { id: 'warranty', label: 'Гарантия' },
      { id: 'contact', label: 'Контакты' },
    ],
    cta: 'Оставить заявку',
  },


  // Page-level copy. The nav, the <title>, and the overview cards on the home
  // page all read from here, so a page cannot appear in one and be missing from
  // another. Descriptions are one sentence, written for the meta tag first.
  pages: {
    home: {
      nav: 'Главная',
      title: 'Calido Radiators',
      description:
        'Завод алюминиевых и биметаллических радиаторов в Узбекистане. Работаем с 2015 года.',
      card: 'Обзор завода и продукции.',
    },
    about: {
      nav: 'О заводе',
      title: 'О заводе',
      description:
        'Производство, мощности, контроль качества и гарантия на радиаторы Calido.',
      card: 'Кто мы, сколько выпускаем и как проверяем каждую секцию.',
    },
    technology: {
      nav: 'Технология',
      title: 'Технология',
      description:
        'Литьё под высоким давлением, устройство биметаллической секции и теплоотдача.',
      card: 'Литьё под давлением, устройство секции, теплоотдача.',
    },
    models: {
      nav: 'Модельный ряд',
      title: 'Модельный ряд',
      description: 'Шесть моделей радиаторов Calido, сравнение размеров и заводские цвета.',
      card: 'Шесть моделей, сравнение по высоте, теплоотдаче и весу.',
    },
    installation: {
      nav: 'Монтаж',
      title: 'Монтаж',
      description: 'Совместимость с системами отопления и типы подключения радиатора.',
      card: 'Совместимость с системами и три типа подключения.',
    },
    contact: {
      nav: 'Контакты',
      title: 'Контакты',
      description: 'Оставьте заявку: подберём модель и рассчитаем количество секций.',
      card: 'Расчёт количества секций под ваш объект.',
    },
  },

  overview: {
    title: 'Что дальше',
    lead: 'Четыре раздела: производство, технология, модельный ряд и монтаж.',
  },

  start: {
    title: 'Рассчитаем ваш объект',
    lead: 'Скажите площадь и тип системы. Подберём модель и количество секций.',
  },

  progress: { label: 'Прогресс просмотра', of: 'из' },

  hero: {
    index: '01',
    kicker: 'Узбекистан · с 2015 года',
    title: 'Тепло, которому доверяют',
    lead: 'Современные радиаторы отопления для домов, квартир и коммерческих объектов.',
    sub: 'Создаём тепло, которому доверяют тысячи клиентов.',
    cta: 'Смотреть модельный ряд',
    scroll: 'Листайте вниз',
    imageAlt: 'Секция алюминиевого радиатора Calido крупным планом',
  },

  about: {
    index: '02',
    kicker: 'Кто мы',
    title: 'Кто мы?',
    lead: 'Calido: современный завод по производству алюминиевых и биметаллических радиаторов.',
    sinceLabel: 'Работаем с',
    since: 2015,
    sinceSuffix: 'года',
    imageAlt: 'Радиатор Calido в стальном исполнении, вид сверху',
  },

  capacity: {
    index: '03',
    kicker: 'Производство',
    title: 'Производственные мощности',
    more: 'Более',
    count: 5_000_000,
    unit: 'секций в год',
    standards: 'Производство соответствует международным стандартам EN и ISO.',
    factoryAlt: 'Схематическая иконка производственного корпуса',
    imageAlt: 'Радиатор Calido в зелёном исполнении',
  },

  technology: {
    index: '04',
    kicker: 'Технология',
    title: 'Современные технологии',
    lead: 'Производство осуществляется методом литья под высоким давлением, что обеспечивает прочность, надёжность и высокую теплоотдачу.',
    stages: [
      { id: 'mould', label: 'Форма', text: 'Стальная пресс-форма готова к заливке.' },
      { id: 'melt', label: 'Расплав', text: 'Алюминий заполняет форму под высоким давлением.' },
      { id: 'cast', label: 'Секция', text: 'Готовая секция: плотная структура без пустот.' },
    ],
    imageAlt: 'Секция радиатора Calido, отлитая под высоким давлением',
  },

  // Transcribed from the printed catalogue spread "Как устроен биметаллический
  // радиатор" (p. 7).
  //
  // The spread prints six loose callouts. Here they are regrouped onto the four
  // parts the section actually comes apart into, because a leader line has to
  // point at something: "любой цвет на ваш выбор" is a property of the coating,
  // not a seventh component. Every claim from the spread survives, none is
  // added.
  anatomy: {
    index: '05',
    kicker: 'Конструкция',
    title: 'Как устроен биметаллический радиатор',
    hint: 'Наведите на подпись, чтобы найти деталь на снимке',
    parts: [
      {
        id: 'collector',
        label: 'Стальной коллектор',
        text: 'Полностью стальной коллектор.',
      },
      {
        id: 'fins',
        label: 'Алюминиевое оребрение',
        text: 'Литьё под давлением. Небольшой объём теплоносителя гарантирует высокую энергоэффективность и малую инерционность.',
      },
      {
        id: 'body',
        label: 'Секция в сборе',
        text: 'Умный дизайн.',
      },
      {
        id: 'coating',
        label: 'Покрытие',
        text: 'Стойкая двухэтапная покраска. Любой цвет на ваш выбор.',
      },
    ],
    imageAlt: 'Секция биметаллического радиатора Calido в разрезе конструкции',
  },

  quality: {
    index: '06',
    kicker: 'Качество',
    title: 'Контроль качества',
    lead: 'Каждый радиатор проходит многоступенчатый контроль качества на всех этапах производства.',
    sub: 'Потому что надёжность начинается ещё на заводе.',
    checks: [
      'Входной контроль сплава',
      'Контроль геометрии секции',
      'Опрессовка под давлением',
      'Приёмка покрытия',
    ],
    imageAlt: 'Белый радиатор Calido, вертикальный ракурс',
  },

  heat: {
    index: '07',
    kicker: 'Теплоотдача',
    title: 'Высокая теплоотдача',
    lead: 'Современная конструкция обеспечивает быстрый нагрев помещения и эффективное распределение тепла.',
    peakLabel: 'До',
    peak: 198,
    peakUnit: 'Вт на секцию',
    imageAlt: 'Оребрение радиатора Calido крупным планом',
  },

  benefits: {
    index: '08',
    kicker: 'Преимущества',
    title: 'Преимущества',
    items: [
      'Высокая теплоотдача',
      'Защита от коррозии',
      'Надёжная герметичность',
      'Долгий срок службы',
    ],
    imageAlt: 'Радиатор Calido в синем исполнении',
  },

  systems: {
    index: '09',
    kicker: 'Совместимость',
    title: 'Для любых систем отопления',
    lead: 'Подходят для квартир, частных домов и коммерческих помещений.',
    sub: 'Совместимы с центральными и автономными системами отопления.',
    blocks: [
      { title: 'Помещения', items: ['Квартиры', 'Частные дома', 'Коммерческие объекты'] },
      { title: 'Системы', items: ['Центральное отопление', 'Автономное отопление'] },
    ],
    imageAlt: 'Радиатор Calido на стене светлой комнаты',
  },

  // Transcribed from the catalogue spread "Типы подключения" (p. 10). The
  // diagrams are redrawn as vector rather than reproduced from the print scan.
  connection: {
    index: '10',
    kicker: 'Монтаж',
    title: 'Типы подключения',
    items: [
      { id: 'side', num: '1', label: 'Боковое' },
      { id: 'bottom', num: '2', label: 'Нижнее' },
      { id: 'diagonal', num: '3', label: 'Диагональное' },
    ],
    legend: { supply: 'Подача', return: 'Обратка' },
    body: 'Секции радиатора Calido изготавливаются из высококачественного алюминиевого сплава методом литья под высоким давлением. Внешне радиаторы выглядят эстетично, удобны для монтажа на поверхности стен и вписываются в любой интерьер.',
    diagramAlt: 'Схема подключения радиатора',
  },

  range: {
    index: '11',
    kicker: 'Продукция',
    title: 'Модельный ряд',
    lead: 'Шесть моделей: от компактной CLASSIC 350 до флагманской INFINITY.',
    hint: 'Прокрутите, чтобы пройти ряд',
    specLabels: {
      centerDistance: 'Межосевое расстояние',
      sectionSize: 'Размер секции',
      sectionWeight: 'Вес секции',
      heatOutput: 'Теплоотдача',
      sectionVolume: 'Объём секции',
      maxTemperature: 'Максимальная температура',
      workingPressure: 'Максимальное рабочее давление',
      testPressure: 'Испытательное давление',
    },
    units: { mm: 'мм', kg: 'кг', w: 'Вт', l: 'л', c: '°C', atm: 'атм' },
    taglines: {
      infinity: 'Минимализм. Надёжность. Тепло.',
      elegant: 'Стиль. Эффективность. Надёжность.',
      'elegant-premium': 'Стиль. Эффективность. Надёжность.',
      classic: 'Надёжность. Практичность. Комфорт.',
      bravo: 'Лёгкость, надёжность и эффективная теплоотдача.',
      'classic-350': 'Компактность. Надёжность. Комфорт.',
    },
    highlights: {
      infinity: ['Высокая теплоотдача', 'Современный дизайн', 'Надёжность на долгие годы'],
      elegant: ['Высокая теплоотдача', 'Современный дизайн', 'Гарантия 10 лет'],
      // 230 Вт — максимум по таблице характеристик всего ряда.
      'elegant-premium': [
        'Максимальная теплоотдача в ряду, 230 Вт',
        'Современный дизайн',
        'Гарантия 10 лет',
      ],
      classic: ['Высокая теплоотдача', 'Надёжная конструкция', 'Гарантия 10 лет'],
      bravo: ['Лёгкая алюминиевая конструкция', 'Эффективная теплоотдача', 'Гарантия 10 лет'],
      'classic-350': ['Компактный размер', 'Высокая теплоотдача', 'Гарантия 10 лет'],
    },
    imageAlt: 'Радиатор Calido',
    counterLabel: 'Модель',
    prev: 'Предыдущая модель',
    next: 'Следующая модель',
  },

  // Its own section now, not the seventh card of the slider. A comparison of
  // the whole range is a different kind of object from a product card, and
  // parking it at the end of a card track hid it behind a horizontal scroll.
  scale: {
    kicker: 'Сравнение',
    title: 'Размеры в масштабе',
    note: 'Все шесть моделей в одном масштабе. Разница по высоте секции составляет 161 мм между самой высокой и самой низкой.',
    lineupAlt: 'Модельный ряд радиаторов Calido в ряд по убыванию высоты',
    // The height spread across five of the six models is 33 mm, which no chart
    // can make legible on its own — hence the metric switch and the printed
    // figures next to every bar.
    metricLabel: 'Сравнить по',
    metrics: [
      { id: 'height', label: 'Высоте секции', unit: 'мм' },
      { id: 'output', label: 'Теплоотдаче', unit: 'Вт' },
      { id: 'weight', label: 'Весу секции', unit: 'кг' },
    ],
    axisLabel: 'Шкала',
    baselineLabel: 'Общая база',
  },

  colors: {
    index: '12',
    kicker: 'Покрытие',
    title: 'Разнообразие цветов',
    lead: 'Радиаторы Calido могут быть окрашены в любой цвет.',
    note: 'Ниже пять заводских исполнений. Другие цвета по RAL доступны под заказ.',
    swatchLabel: 'Выбрать цвет',
    names: {
      white: 'Белый',
      indigo: 'Индиго',
      green: 'Зелёный',
      graphite: 'Графит',
      terracotta: 'Терракота',
    },
    imageAlt: 'Секция радиатора Calido в цвете',
  },

  warranty: {
    index: '13',
    kicker: 'Гарантия',
    title: 'Гарантия',
    lead: 'Мы уверены в качестве своей продукции.',
    number: '10',
    years: 'лет',
    sub: 'Гарантия 10 лет.',
    imageAlt: 'Радиатор Calido в горчичном исполнении',
  },

  contact: {
    index: '14',
    kicker: 'Связаться',
    title: 'Оставьте заявку',
    lead: 'Расскажите о задаче. Подберём модель и рассчитаем количество секций.',
    form: {
      name: { label: 'Имя', placeholder: 'Как к вам обращаться' },
      phone: { label: 'Телефон', placeholder: '+998 __ ___ __ __' },
      message: { label: 'Сообщение', placeholder: 'Объект, количество секций, сроки' },
      submit: 'Отправить заявку',
      sending: 'Отправляем…',
      success: 'Заявка принята. Мы свяжемся с вами.',
      error: 'Не удалось отправить. Попробуйте ещё раз.',
      required: 'Обязательное поле',
    },
    summary: [
      { label: 'Производство', value: 'Узбекистан, с 2015 года' },
      { label: 'Мощность', value: '5 000 000 секций в год' },
      { label: 'Стандарты', value: 'EN, ISO' },
      { label: 'Гарантия', value: '10 лет' },
    ],
    // TODO: заменить на реальные реквизиты, когда заказчик их пришлёт.
    details: {
      title: 'Контакты',
      items: [
        { label: 'Телефон', value: 'уточняется' },
        { label: 'E-mail', value: 'уточняется' },
        { label: 'Адрес', value: 'уточняется' },
      ],
    },
    social: { title: 'Соцсети', items: [] as { label: string; href: string }[] },
    legal: '© {year} Calido Radiators®. Все права защищены.',
  },

  common: {
    logoAlt: 'Calido Radiators',
    close: 'Закрыть',
  },
} as const;
