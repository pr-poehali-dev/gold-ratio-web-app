import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const PHI = 1.618033988749;

const Index = () => {
  const [inputValue, setInputValue] = useState('100');
  const [results, setResults] = useState({ smaller: 0, larger: 0 });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    calculateGoldenRatio(inputValue);
  }, [inputValue]);

  const calculateGoldenRatio = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setResults({ smaller: 0, larger: 0 });
      return;
    }
    setResults({
      smaller: num / PHI,
      larger: num * PHI
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    calculateGoldenRatio(value);
  };

  const drawGoldenSpiral = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;

    let size = Math.min(width, height) * 0.8;
    let x = width / 2 - size / 2;
    let y = height / 2 - size / 2;

    ctx.strokeStyle = '#E5E5E5';
    for (let i = 0; i < 8; i++) {
      ctx.strokeRect(x, y, size, size / PHI);
      
      const nextSize = size / PHI;
      const temp = x;
      x = x + size - nextSize;
      y = y;
      size = nextSize;

      if (i % 2 === 0) {
        y = y + size;
      }
    }

    size = Math.min(width, height) * 0.8;
    x = width / 2 - size / 2;
    y = height / 2 - size / 2;

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i < 7; i++) {
      const radius = size / PHI;
      
      const startAngle = (i % 4) * Math.PI / 2;
      const endAngle = startAngle + Math.PI / 2;

      let centerX, centerY;
      switch (i % 4) {
        case 0:
          centerX = x + size;
          centerY = y + size / PHI;
          break;
        case 1:
          centerX = x + size - radius;
          centerY = y;
          break;
        case 2:
          centerX = x;
          centerY = y + radius;
          break;
        case 3:
          centerX = x + radius;
          centerY = y + size / PHI;
          break;
        default:
          centerX = x;
          centerY = y;
      }

      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);

      const nextSize = size / PHI;
      switch (i % 4) {
        case 0:
          x = x + size - nextSize;
          break;
        case 1:
          y = y + size / PHI - nextSize;
          break;
        case 2:
          x = x;
          break;
        case 3:
          y = y + size / PHI;
          break;
      }
      size = nextSize;
    }

    ctx.stroke();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      drawGoldenSpiral();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, загрузите изображение');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(event.target?.result as string);
        drawImageWithGrid(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawImageWithGrid = (img: HTMLImageElement) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxWidth = 800;
    const maxHeight = 600;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;

    const goldenY = height / PHI;
    const goldenX = width / PHI;

    ctx.beginPath();
    ctx.moveTo(0, goldenY);
    ctx.lineTo(width, goldenY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, height - goldenY);
    ctx.lineTo(width, height - goldenY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(goldenX, 0);
    ctx.lineTo(goldenX, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - goldenX, 0);
    ctx.lineTo(width - goldenX, height);
    ctx.stroke();
  };

  const downloadCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>, filename: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Изображение сохранено');
    });
  };

  const examples = [
    {
      title: 'Парфенон',
      description: 'Античная архитектура использует золотое сечение в пропорциях фасада',
      ratio: 'Высота к ширине = 1:φ',
      image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&q=80'
    },
    {
      title: 'Мона Лиза',
      description: 'Леонардо да Винчи применял золотое сечение в композиции портрета',
      ratio: 'Лицо вписано в золотой прямоугольник',
      image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&q=80'
    },
    {
      title: 'Раковина наутилуса',
      description: 'Природная спираль точно следует пропорциям золотого сечения',
      ratio: 'Каждый виток = φ × предыдущий',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&q=80'
    },
    {
      title: 'Подсолнух',
      description: 'Семена расположены по спирали Фибоначчи',
      ratio: 'Угол между семенами ≈ 137.5°',
      image: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=400&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">Золотое сечение</h1>
              <p className="text-gray-500 mt-2">φ = 1.618033988749...</p>
            </div>
            <div className="text-6xl" style={{ color: '#D4AF37' }}>φ</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Icon name="Calculator" size={18} />
              Калькулятор
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <Icon name="Sparkles" size={18} />
              Визуализация
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex items-center gap-2">
              <Icon name="Image" size={18} />
              Анализ фото
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Icon name="Shapes" size={18} />
              Галерея
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Расчёт пропорций</h2>
                  <p className="text-gray-600">Введите число, чтобы рассчитать золотые пропорции</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Исходная величина</label>
                    <Input
                      type="number"
                      value={inputValue}
                      onChange={handleInputChange}
                      className="text-lg"
                      placeholder="100"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Меньшая величина</div>
                      <div className="text-3xl font-bold font-mono">{results.smaller.toFixed(3)}</div>
                      <div className="text-sm text-gray-500 mt-2">= {inputValue} ÷ φ</div>
                    </div>

                    <div className="p-6 rounded-lg" style={{ backgroundColor: '#D4AF37' }}>
                      <div className="text-sm text-black mb-1">Большая величина</div>
                      <div className="text-3xl font-bold text-black font-mono">{results.larger.toFixed(3)}</div>
                      <div className="text-sm text-black/80 mt-2">= {inputValue} × φ</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>Формула:</strong> a/b = (a+b)/a = φ ≈ 1.618</p>
                      <p><strong>Применение:</strong> дизайн, архитектура, фотография, природа</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6">
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Золотая спираль</h2>
                    <p className="text-gray-600">Визуализация золотого прямоугольника и спирали Фибоначчи</p>
                  </div>
                  <Button
                    onClick={() => downloadCanvas(canvasRef, 'golden-spiral.png')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Icon name="Download" size={18} />
                    Сохранить
                  </Button>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="max-w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <div className="text-sm font-medium mb-1">Прямоугольники</div>
                    <div className="text-xs text-gray-600">Каждый следующий = φ × предыдущий</div>
                  </div>
                  <div className="p-4 rounded" style={{ backgroundColor: '#D4AF37', color: '#000' }}>
                    <div className="text-sm font-medium mb-1">Спираль</div>
                    <div className="text-xs text-black/80">Дуги четверти окружности</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <div className="text-sm font-medium mb-1">Пропорция</div>
                    <div className="text-xs text-gray-600">1 : 1.618 : 2.618 : 4.236...</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="photo" className="space-y-6">
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Анализ композиции</h2>
                    <p className="text-gray-600">Загрузите фото для наложения сетки золотого сечения</p>
                  </div>
                  {uploadedImage && (
                    <Button
                      onClick={() => downloadCanvas(imageCanvasRef, 'golden-grid-analysis.png')}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Icon name="Download" size={18} />
                      Сохранить
                    </Button>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <Icon name="Upload" size={20} />
                    Загрузить фото
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {uploadedImage && (
                  <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                    <canvas
                      ref={imageCanvasRef}
                      className="max-w-full rounded shadow-lg"
                    />
                  </div>
                )}

                <div className="pt-4 border-t text-sm text-gray-600 space-y-2">
                  <p><strong>Линии сетки:</strong> размещайте ключевые элементы на пересечениях</p>
                  <p><strong>Правило третей:</strong> упрощённая версия золотого сечения</p>
                  <p><strong>Фокусные точки:</strong> глаз естественно притягивается к этим зонам</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Примеры из искусства и природы</h2>
              <p className="text-gray-600">Золотое сечение встречается в архитектуре, живописи и природных формах</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {examples.map((example, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={example.image}
                      alt={example.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="text-xl font-semibold">{example.title}</h3>
                    <p className="text-gray-600 text-sm">{example.description}</p>
                    <div className="pt-2 border-t">
                      <div className="inline-block px-3 py-1 rounded text-sm font-mono" style={{ backgroundColor: '#D4AF37', color: '#000' }}>
                        {example.ratio}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-8 mt-8" style={{ backgroundColor: '#D4AF37' }}>
              <div className="space-y-4 text-black">
                <h3 className="text-xl font-semibold">Числа Фибоначчи</h3>
                <p className="text-black/90">Последовательность: 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...</p>
                <p className="text-black/90">Отношение соседних чисел стремится к φ:</p>
                <div className="font-mono text-sm space-y-1 text-black/80">
                  <div>5/3 = 1.666...</div>
                  <div>8/5 = 1.600</div>
                  <div>13/8 = 1.625</div>
                  <div>21/13 = 1.615...</div>
                  <div>144/89 = 1.61797...</div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>Золотое сечение — φ (фи) — математическая константа, равная приблизительно 1.618</p>
            <p className="mt-2">Используется в искусстве, архитектуре, дизайне и встречается в природе</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;