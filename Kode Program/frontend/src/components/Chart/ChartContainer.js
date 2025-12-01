import { useRef } from 'react';
import html2canvas from 'html2canvas';

const ChartContainer = ({ 
  title, 
  children, 
  description,
  downloadFileName = 'chart.png',
  className = ''
}) => {
  const chartContainerRef = useRef(null);

  const handleCaptureScreenshot = async () => {
    if (!chartContainerRef.current) return;

    try {
      const canvas = await html2canvas(chartContainerRef.current, {
        useCORS: true,
        scale: 2,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = downloadFileName;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button 
          onClick={handleCaptureScreenshot}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Unduh Chart
        </button>
      </div>
      
      <div ref={chartContainerRef}>
        {children}
      </div>
      
      {description && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          {description}
        </div>
      )}
    </div>
  );
};

export default ChartContainer;