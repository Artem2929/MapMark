import React, { useState } from 'react';
import './ProfileExport.css';

const ProfileExport = ({ userId }) => {
  const [exporting, setExporting] = useState(false);

  const exportUserData = async (format) => {
    setExporting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/user/${userId}/reviews`);
      const data = await response.json();
      
      if (data.success) {
        const reviews = data.data;
        
        if (format === 'json') {
          const jsonData = JSON.stringify(reviews, null, 2);
          downloadFile(jsonData, 'my-reviews.json', 'application/json');
        } else if (format === 'csv') {
          const csvData = convertToCSV(reviews);
          downloadFile(csvData, 'my-reviews.csv', 'text/csv');
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Помилка при експорті даних');
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (reviews) => {
    const headers = ['Дата', 'Оцінка', 'Текст відгуку', 'Широта', 'Довгота'];
    const rows = reviews.map(review => [
      new Date(review.createdAt).toLocaleDateString('uk-UA'),
      review.rating,
      `"${review.text.replace(/"/g, '""')}"`,
      review.lat || '',
      review.lng || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="profile-export">
      <h4>Експорт даних</h4>
      <p>Завантажте свої дані у зручному форматі</p>
      
      <div className="export-buttons">
        <button 
          className="export-btn json"
          onClick={() => exportUserData('json')}
          disabled={exporting}
        >
          <span className="btn-icon">📄</span>
          <span className="btn-text">JSON</span>
        </button>
        
        <button 
          className="export-btn csv"
          onClick={() => exportUserData('csv')}
          disabled={exporting}
        >
          <span className="btn-icon">📊</span>
          <span className="btn-text">CSV</span>
        </button>
      </div>
      
      {exporting && (
        <div className="export-loading">
          <div className="loading-spinner"></div>
          <span>Підготовка файлу...</span>
        </div>
      )}
    </div>
  );
};

export default ProfileExport;