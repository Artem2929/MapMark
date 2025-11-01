const express = require('express');
const Country = require('../models/Country');
const Region = require('../models/Region');
const router = express.Router();

// GET /api/filters - отримати всі фільтри
router.get('/', async (req, res) => {
  try {
    const countries = await Country.find({ isActive: true }).select('value label -_id');
    const regions = await Region.find({ isActive: true }).select('value label -_id');
    
    const filters = {
      countries: [{ value: '', label: 'Всі країни' }, ...countries],
      regions: [{ value: '', label: 'Всі області' }, ...regions]
    };

    res.json(filters);
  } catch (error) {
    console.error('Error getting filters:', error);
    res.status(500).json({ error: 'Помилка отримання фільтрів' });
  }
});

// POST /api/filters/init - ініціалізація даних
router.post('/init', async (req, res) => {
  try {
    // Додаємо країну
    await Country.findOneAndUpdate(
      { value: 'ukraine' },
      { value: 'ukraine', label: '🇺🇦 Україна', isActive: true },
      { upsert: true }
    );

    // Додаємо області
    const regions = [
      { value: 'kyiv-region', label: 'Київська' },
      { value: 'kharkiv-region', label: 'Харківська' },
      { value: 'odesa-region', label: 'Одеська' },
      { value: 'dnipropetrovsk-region', label: 'Дніпропетровська' },
      { value: 'donetsk-region', label: 'Донецька' },
      { value: 'zaporizhzhia-region', label: 'Запорізька' },
      { value: 'lviv-region', label: 'Львівська' },
      { value: 'poltava-region', label: 'Полтавська' },
      { value: 'chernihiv-region', label: 'Чернігівська' },
      { value: 'cherkasy-region', label: 'Черкаська' },
      { value: 'zhytomyr-region', label: 'Житомирська' },
      { value: 'sumy-region', label: 'Сумська' },
      { value: 'rivne-region', label: 'Рівненська' },
      { value: 'khmelnytskyi-region', label: 'Хмельницька' },
      { value: 'vinnytsia-region', label: 'Вінницька' },
      { value: 'ternopil-region', label: 'Тернопільська' },
      { value: 'ivano-frankivsk-region', label: 'Івано-Франківська' },
      { value: 'zakarpattia-region', label: 'Закарпатська' },
      { value: 'chernivtsi-region', label: 'Чернівецька' },
      { value: 'volyn-region', label: 'Волинська' },
      { value: 'kirovohrad-region', label: 'Кіровоградська' },
      { value: 'mykolaiv-region', label: 'Миколаївська' },
      { value: 'kherson-region', label: 'Херсонська' },
      { value: 'luhansk-region', label: 'Луганська' }
    ];

    for (const region of regions) {
      await Region.findOneAndUpdate(
        { value: region.value },
        { ...region, countryValue: 'ukraine', isActive: true },
        { upsert: true }
      );
    }

    res.json({ success: true, message: 'Дані ініціалізовано' });
  } catch (error) {
    console.error('Error initializing filters:', error);
    res.status(500).json({ error: 'Помилка ініціалізації' });
  }
});

module.exports = router;