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

  // The strip above the header — the three facts that answer "who is this" before
  // the visitor has scrolled anything. Deliberately not the phone and address of
  // the source template: the phone belongs beside the form, not in a strip the
  // visitor reads before they know what the company makes.
  topbar: {
    label: 'Коротко о заводе',
    items: [
      { label: 'Производство', value: 'Узбекистан, с 2015 года' },
      { label: 'Мощность', value: '5 000 000 секций в год' },
      { label: 'Гарантия', value: '10 лет' },
    ],
  },

  breadcrumb: { label: 'Хлебные крошки' },

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
    // Split out rather than marked up in the string: the component wraps this
    // substring in <strong>, and a dictionary that carries HTML is a dictionary
    // a translator can break.
    standardsMark: 'EN и ISO',
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
    peak: 230,
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
    // First sentence only. The second one used to print "161 мм" as a literal,
    // which was true of the height and wrong of the other two metrics the
    // switch below offers — so the spread now comes from `gap`, per metric,
    // with the figure computed off the same table the bars are drawn from.
    note: 'Все шесть моделей в одном масштабе.',
    lineupAlt: 'Модельный ряд радиаторов Calido в ряд по убыванию высоты',
    // The height spread across five of the six models is 33 mm, which no chart
    // can make legible on its own — hence the metric switch and the printed
    // figures next to every bar.
    // "Показатель", not "Сравнить по". The three labels below are the names of
    // the metrics in the nominative, because each one is read on its own as a
    // button caption; the dative they used to be in only parsed while the eye
    // carried "Сравнить по" down into the chip, and standalone "ВЕСУ СЕКЦИИ"
    // reads as a typo. The legend changes with them — the alternative was to
    // leave one label in the nominative and two in the dative, which is worse
    // than either.
    metricLabel: 'Показатель',
    // `gap` carries the whole sentence rather than being assembled from the
    // label: the sentence needs the dative ("по весу секции") that the buttons
    // no longer use, and the superlatives at the end change gender with the
    // subject.
    metrics: [
      {
        id: 'height',
        label: 'Высота секции',
        unit: 'мм',
        gap: 'Разница по высоте секции составляет {value} между самой высокой и самой низкой.',
      },
      {
        id: 'output',
        label: 'Теплоотдача',
        unit: 'Вт',
        gap: 'Разница по теплоотдаче составляет {value} между самой мощной и самой слабой.',
      },
      {
        id: 'weight',
        label: 'Вес секции',
        unit: 'кг',
        gap: 'Разница по весу секции составляет {value} между самой тяжёлой и самой лёгкой.',
      },
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
      phone: {
        label: 'Телефон',
        // The dial code lives in the selector beside the field, so the
        // placeholder shows only what the visitor actually types.
        placeholder: '90 123 45 67',
        countryLabel: 'Код страны',
        empty: 'Укажите номер телефона.',
        length: 'Проверьте номер: для выбранной страны в нём другое количество цифр.',
      },
      telegram: { label: 'Telegram', placeholder: '@username', hint: 'необязательно' },
      message: { label: 'Сообщение', placeholder: 'Объект, количество секций, сроки' },
      submit: 'Отправить заявку',
      sending: 'Отправляем…',
      success: 'Заявка принята. Мы свяжемся с вами.',
      error: 'Не удалось отправить. Попробуйте ещё раз.',
      required: 'Обязательное поле',
    },
    direct: {
      title: 'Или напишите напрямую',
      // Accessible names for the links. The visible label is the contact value
      // itself, which on its own does not say what channel it is.
      names: {
        phone: 'Телефон',
        telegram: 'Telegram',
        whatsapp: 'WhatsApp',
        email: 'E-mail',
        location: 'Локация',
      },
      locationAria: 'Открыть расположение завода на Яндекс Картах',
    },
    // Values come from content/contacts.ts — the single place requisites are
    // edited. Only the labels are translated, which is why they are all that
    // is left here.
    details: {
      title: 'Контакты',
      labels: { phone: 'Телефон', email: 'E-mail', location: 'Локация', address: 'Адрес' },
      // The location row has a label but no printable value — a map URL is not
      // something anyone reads — so this is what the link itself says.
      mapText: 'Яндекс Карты',
    },
    social: { title: 'Соцсети', items: [] as { label: string; href: string }[] },
    legal: '© {year} Calido Radiators®. Все права защищены.',
  },

  common: {
    logoAlt: 'Calido Radiators',
    close: 'Закрыть',
  },
} as const;
