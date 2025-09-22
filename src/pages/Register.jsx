import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomSelect from '../components/ui/CustomSelect';
import authService from '../services/authService';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const countries = [
    { code: 'UA', name_en: 'Україна' },
    { code: 'US', name_en: 'США' },
    { code: 'CA', name_en: 'Канада' },
    { code: 'GB', name_en: 'Великобританія' },
    { code: 'DE', name_en: 'Німеччина' },
    { code: 'FR', name_en: 'Франція' },
    { code: 'IT', name_en: 'Італія' },
    { code: 'ES', name_en: 'Іспанія' },
    { code: 'PL', name_en: 'Польща' },
    { code: 'JP', name_en: 'Японія' },
    { code: 'AU', name_en: 'Австралія' },
    { code: 'BR', name_en: 'Бразилія' },
    { code: 'CN', name_en: 'Китай' },
    { code: 'IN', name_en: 'Індія' },
    { code: 'RU', name_en: 'Росія' },
    { code: 'MX', name_en: 'Мексика' },
    { code: 'AR', name_en: 'Аргентина' },
    { code: 'ZA', name_en: 'ПАР' },
    { code: 'EG', name_en: 'Єгипет' },
    { code: 'NG', name_en: 'Нігерія' },
    { code: 'KE', name_en: 'Кенія' },
    { code: 'MA', name_en: 'Марокко' },
    { code: 'TN', name_en: 'Туніс' },
    { code: 'DZ', name_en: 'Алжир' },
    { code: 'LY', name_en: 'Лівія' },
    { code: 'SD', name_en: 'Судан' },
    { code: 'ET', name_en: 'Ефіопія' },
    { code: 'GH', name_en: 'Гана' },
    { code: 'UG', name_en: 'Уганда' },
    { code: 'TZ', name_en: 'Танзанія' },
    { code: 'MZ', name_en: 'Мозамбік' },
    { code: 'MG', name_en: 'Мадагаскар' },
    { code: 'AO', name_en: 'Ангола' },
    { code: 'ZM', name_en: 'Замбія' },
    { code: 'ZW', name_en: 'Зімбабве' },
    { code: 'BW', name_en: 'Ботсвана' },
    { code: 'NA', name_en: 'Намібія' },
    { code: 'SZ', name_en: 'Есватіні' },
    { code: 'LS', name_en: 'Лесото' },
    { code: 'MW', name_en: 'Малаві' },
    { code: 'RW', name_en: 'Руанда' },
    { code: 'BI', name_en: 'Бурунді' },
    { code: 'DJ', name_en: 'Джибуті' },
    { code: 'ER', name_en: 'Еритрея' },
    { code: 'SO', name_en: 'Сомалі' },
    { code: 'SS', name_en: 'Південний Судан' },
    { code: 'CF', name_en: 'ЦАР' },
    { code: 'TD', name_en: 'Чад' },
    { code: 'NE', name_en: 'Нігер' },
    { code: 'ML', name_en: 'Малі' },
    { code: 'BF', name_en: 'Буркіна-Фасо' },
    { code: 'CI', name_en: 'Кот-д’Івуар' },
    { code: 'LR', name_en: 'Ліберія' },
    { code: 'SL', name_en: 'Сьєрра-Леоне' },
    { code: 'GN', name_en: 'Гвінея' },
    { code: 'GW', name_en: 'Гвінея-Бісау' },
    { code: 'GM', name_en: 'Гамбія' },
    { code: 'SN', name_en: 'Сенегал' },
    { code: 'MR', name_en: 'Мавританія' },
    { code: 'CV', name_en: 'Кабо-Верде' },
    { code: 'ST', name_en: 'Сан-Томе і Прінсіпі' },
    { code: 'GQ', name_en: 'Екваторіальна Гвінея' },
    { code: 'GA', name_en: 'Габон' },
    { code: 'CG', name_en: 'Конго' },
    { code: 'CD', name_en: 'ДР Конго' },
    { code: 'CM', name_en: 'Камерун' },
    { code: 'KR', name_en: 'Південна Корея' },
    { code: 'KP', name_en: 'Північна Корея' },
    { code: 'MN', name_en: 'Монголія' },
    { code: 'KZ', name_en: 'Казахстан' },
    { code: 'UZ', name_en: 'Узбекистан' },
    { code: 'TM', name_en: 'Туркменістан' },
    { code: 'TJ', name_en: 'Таджикистан' },
    { code: 'KG', name_en: 'Киргизстан' },
    { code: 'AF', name_en: 'Афганістан' },
    { code: 'PK', name_en: 'Пакистан' },
    { code: 'BD', name_en: 'Бангладеш' },
    { code: 'LK', name_en: 'Шрі-Ланка' },
    { code: 'MV', name_en: 'Мальдіви' },
    { code: 'NP', name_en: 'Непал' },
    { code: 'BT', name_en: 'Бутан' },
    { code: 'MM', name_en: 'М’янма' },
    { code: 'TH', name_en: 'Таїланд' },
    { code: 'LA', name_en: 'Лаос' },
    { code: 'KH', name_en: 'Камбоджа' },
    { code: 'VN', name_en: 'В’єтнам' },
    { code: 'MY', name_en: 'Малайзія' },
    { code: 'SG', name_en: 'Сінгапур' },
    { code: 'BN', name_en: 'Бруней' },
    { code: 'ID', name_en: 'Індонезія' },
    { code: 'TL', name_en: 'Східний Тимор' },
    { code: 'PH', name_en: 'Філіппіни' },
    { code: 'TW', name_en: 'Тайвань' },
    { code: 'HK', name_en: 'Гонконг' },
    { code: 'MO', name_en: 'Макао' },
    { code: 'FJ', name_en: 'Фіджі' },
    { code: 'PG', name_en: 'Папуа-Нова Гвінея' },
    { code: 'SB', name_en: 'Соломонові Острови' },
    { code: 'VU', name_en: 'Вануату' },
    { code: 'NC', name_en: 'Нова Каледонія' },
    { code: 'NZ', name_en: 'Нова Зеландія' },
    { code: 'WS', name_en: 'Самоа' },
    { code: 'TO', name_en: 'Тонга' },
    { code: 'TV', name_en: 'Тувалу' },
    { code: 'KI', name_en: 'Кірибаті' },
    { code: 'NR', name_en: 'Науру' },
    { code: 'MH', name_en: 'Маршаллові Острови' },
    { code: 'FM', name_en: 'Мікронезія' },
    { code: 'PW', name_en: 'Палау' },
    { code: 'CZ', name_en: 'Чехія' },
    { code: 'SK', name_en: 'Словаччина' },
    { code: 'HU', name_en: 'Угорщина' },
    { code: 'RO', name_en: 'Румунія' },
    { code: 'BG', name_en: 'Болгарія' },
    { code: 'MD', name_en: 'Молдова' },
    { code: 'BY', name_en: 'Білорусь' },
    { code: 'LT', name_en: 'Литва' },
    { code: 'LV', name_en: 'Латвія' },
    { code: 'EE', name_en: 'Естонія' },
    { code: 'FI', name_en: 'Фінляндія' },
    { code: 'SE', name_en: 'Швеція' },
    { code: 'NO', name_en: 'Норвегія' },
    { code: 'DK', name_en: 'Данія' },
    { code: 'IS', name_en: 'Ісландія' },
    { code: 'IE', name_en: 'Ірландія' },
    { code: 'PT', name_en: 'Португалія' },
    { code: 'AD', name_en: 'Андорра' },
    { code: 'MC', name_en: 'Монако' },
    { code: 'SM', name_en: 'Сан-Маріно' },
    { code: 'VA', name_en: 'Ватикан' },
    { code: 'MT', name_en: 'Мальта' },
    { code: 'CY', name_en: 'Кіпр' },
    { code: 'GR', name_en: 'Греція' },
    { code: 'AL', name_en: 'Албанія' },
    { code: 'MK', name_en: 'Північна Македонія' },
    { code: 'ME', name_en: 'Чорногорія' },
    { code: 'RS', name_en: 'Сербія' },
    { code: 'BA', name_en: 'Боснія і Герцеговина' },
    { code: 'HR', name_en: 'Хорватія' },
    { code: 'SI', name_en: 'Словенія' },
    { code: 'AT', name_en: 'Австрія' },
    { code: 'CH', name_en: 'Швейцарія' },
    { code: 'LI', name_en: 'Ліхтенштейн' },
    { code: 'LU', name_en: 'Люксембург' },
    { code: 'BE', name_en: 'Бельгія' },
    { code: 'NL', name_en: 'Нідерланди' },
    { code: 'TR', name_en: 'Туреччина' },
    { code: 'GE', name_en: 'Грузія' },
    { code: 'AM', name_en: 'Вірменія' },
    { code: 'AZ', name_en: 'Азербайджан' },
    { code: 'IR', name_en: 'Іран' },
    { code: 'IQ', name_en: 'Ірак' },
    { code: 'SY', name_en: 'Сирія' },
    { code: 'LB', name_en: 'Ліван' },
    { code: 'JO', name_en: 'Йорданія' },
    { code: 'IL', name_en: 'Ізраїль' },
    { code: 'PS', name_en: 'Палестина' },
    { code: 'SA', name_en: 'Саудівська Аравія' },
    { code: 'YE', name_en: 'Ємен' },
    { code: 'OM', name_en: 'Оман' },
    { code: 'AE', name_en: 'ОАЕ' },
    { code: 'QA', name_en: 'Катар' },
    { code: 'BH', name_en: 'Бахрейн' },
    { code: 'KW', name_en: 'Кувейт' },
    { code: 'CL', name_en: 'Чілі' },
    { code: 'PE', name_en: 'Перу' },
    { code: 'EC', name_en: 'Еквадор' },
    { code: 'CO', name_en: 'Колумбія' },
    { code: 'VE', name_en: 'Венесуела' },
    { code: 'GY', name_en: 'Гайана' },
    { code: 'SR', name_en: 'Сурінам' },
    { code: 'GF', name_en: 'Французька Гвіана' },
    { code: 'UY', name_en: 'Уругвай' },
    { code: 'PY', name_en: 'Парагвай' },
    { code: 'BO', name_en: 'Болівія' },
    { code: 'GT', name_en: 'Гватемала' },
    { code: 'BZ', name_en: 'Беліз' },
    { code: 'SV', name_en: 'Сальвадор' },
    { code: 'HN', name_en: 'Гондурас' },
    { code: 'NI', name_en: 'Нікарагуа' },
    { code: 'CR', name_en: 'Коста-Ріка' },
    { code: 'PA', name_en: 'Панама' },
    { code: 'CU', name_en: 'Куба' },
    { code: 'JM', name_en: 'Ямайка' },
    { code: 'HT', name_en: 'Гаїті' },
    { code: 'DO', name_en: 'Домініканська Республіка' },
    { code: 'PR', name_en: 'Пуерто-Ріко' },
    { code: 'TT', name_en: 'Трінідад і Тобаго' },
    { code: 'BB', name_en: 'Барбадос' },
    { code: 'GD', name_en: 'Гренада' },
    { code: 'VC', name_en: 'Сент-Вінсент і Гренадини' },
    { code: 'LC', name_en: 'Сент-Люсія' },
    { code: 'DM', name_en: 'Домініка' },
    { code: 'AG', name_en: 'Антигуа і Барбуда' },
    { code: 'KN', name_en: 'Сент-Кітс і Невіс' },
    { code: 'BS', name_en: 'Багамські Острови' }
  ];
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Ви повинні прийняти умови використання');
      return;
    }

    if (!formData.acceptPrivacy) {
      setError('Ви повинні прийняти політику конфіденційності');
      return;
    }

    setLoading(true);

    try {
      await authService.register(formData.name, formData.email, formData.password);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-form-wrapper">
          <h1 className="register-title">Реєстрація в MapMark</h1>
          <p className="register-subtitle">Створіть акаунт, щоб почати</p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleRegister} className="register-form">
            <div className="form-group">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введіть ваше ім'я"
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введіть ваш email"
                required
              />
            </div>
            
            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введіть пароль (мін. 6 символів)"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div className="form-group password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повторіть пароль"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <div className="form-group">
              <CustomSelect
                options={countries}
                value={formData.country}
                onChange={(value) => setFormData({ ...formData, country: value })}
                placeholder="Оберіть країну"
              />
            </div>

            <div className="form-group checkbox-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  required
                />
                <Link to="/terms-of-service" target="_blank">умови використання</Link>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  name="acceptPrivacy"
                  checked={formData.acceptPrivacy}
                  onChange={(e) => setFormData({ ...formData, acceptPrivacy: e.target.checked })}
                  required
                />
                <Link to="/privacy-policy" target="_blank">політику конфіденційності</Link>
              </div>
            </div>
            
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Реєстрація...' : 'Зареєструватися'}
            </button>
          </form>
          
          <div className="register-footer">
            <p>Вже маєте акаунт? <Link to="/login">Увійти</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;