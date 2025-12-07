import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const PHI = 1.618033988749;

const Index = () => {
  const [inputValue, setInputValue] = useState('100');
  const [results, setResults] = useState({ smaller: 0, larger: 0 });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageObject, setImageObject] = useState<HTMLImageElement | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showSpiral, setShowSpiral] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    calculateGoldenRatio(inputValue);
  }, []);

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
        setImageObject(img);
        setImagePosition({ x: 0, y: 0 });
        drawImageWithOverlay(img, 0, 0);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawImageWithOverlay = (img: HTMLImageElement, offsetX: number, offsetY: number) => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxWidth = 900;
    const maxHeight = 700;
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

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, offsetX, offsetY, width, height);

    if (showGrid || showSpiral) {
      const rectWidth = width;
      const rectHeight = height;
      
      const leftWidth = rectWidth / PHI;
      const rightWidth = rectWidth - leftWidth;
      
      const topHeight = rectHeight / PHI;
      const bottomHeight = rectHeight - topHeight;

      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);

      if (showGrid) {
        ctx.strokeRect(0, 0, rectWidth, rectHeight);
        
        ctx.beginPath();
        ctx.moveTo(leftWidth, 0);
        ctx.lineTo(leftWidth, rectHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, topHeight);
        ctx.lineTo(rectWidth, topHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(leftWidth, topHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(leftWidth, 0);
        ctx.lineTo(rectWidth, topHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, topHeight);
        ctx.lineTo(leftWidth, rectHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(leftWidth, topHeight);
        ctx.lineTo(rectWidth, rectHeight);
        ctx.stroke();

        const smallSquareSize = Math.min(rightWidth, topHeight);
        const smallX = leftWidth;
        const smallY = 0;
        
        const innerSize = smallSquareSize / PHI;
        const innerX = smallX + (smallSquareSize - innerSize);
        const innerY = smallY;

        ctx.strokeRect(smallX, smallY, smallSquareSize, smallSquareSize);
        
        if (smallSquareSize > 40) {
          ctx.strokeRect(innerX, innerY, innerSize, innerSize);
          
          const tinySize = innerSize / PHI;
          const tinyX = innerX;
          const tinyY = innerY + (innerSize - tinySize);
          
          if (tinySize > 20) {
            ctx.strokeRect(tinyX, tinyY, tinySize, tinySize);
          }
        }
      }

      if (showSpiral) {
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const arcs = [
          { x: leftWidth, y: 0, r: leftWidth, start: Math.PI, end: Math.PI * 1.5 },
          { x: leftWidth, y: topHeight, r: rightWidth, start: Math.PI * 1.5, end: Math.PI * 2 },
          { x: 0, y: topHeight, r: bottomHeight, start: 0, end: Math.PI * 0.5 },
          { x: leftWidth, y: topHeight, r: leftWidth, start: Math.PI * 0.5, end: Math.PI }
        ];

        const smallSquareSize = Math.min(rightWidth, topHeight);
        const innerSize = smallSquareSize / PHI;
        const innerX = leftWidth + (smallSquareSize - innerSize);
        const innerY = 0;

        arcs.push(
          { x: innerX, y: 0, r: innerSize, start: Math.PI * 1.5, end: Math.PI * 2 }
        );

        if (innerSize > 40) {
          const tinySize = innerSize / PHI;
          const tinyX = innerX;
          const tinyY = innerSize - tinySize;
          
          arcs.push(
            { x: tinyX, y: tinyY, r: tinySize, start: 0, end: Math.PI * 0.5 }
          );

          if (tinySize > 20) {
            const microSize = tinySize / PHI;
            arcs.push(
              { x: tinyX + tinySize - microSize, y: tinyY, r: microSize, start: Math.PI * 0.5, end: Math.PI }
            );
          }
        }

        arcs.forEach(arc => {
          ctx.arc(arc.x, arc.y, arc.r, arc.start, arc.end, false);
        });

        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    if (imageObject) {
      drawImageWithOverlay(imageObject, imagePosition.x, imagePosition.y);
    }
  }, [showSpiral, showGrid]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imageObject) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setImagePosition({ x: newX, y: newY });
    drawImageWithOverlay(imageObject, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const downloadCanvas = () => {
    const canvas = imageCanvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'golden-grid-analysis.png';
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
      image: 'https://cdn.poehali.dev/files/IMG_0638.jpeg'
    },
    {
      title: 'Мона Лиза',
      description: 'Леонардо да Винчи применял золотое сечение в композиции портрета',
      ratio: 'Лицо вписано в золотой прямоугольник',
      image: 'https://cdn.poehali.dev/files/IMG_0643.jpeg'
    },
    {
      title: 'Раковина наутилуса',
      description: 'Природная спираль точно следует пропорциям золотого сечения',
      ratio: 'Каждый виток = φ × предыдущий',
      image: 'https://cdn.poehali.dev/files/IMG_0640.jpeg'
    },
    {
      title: 'Подсолнух',
      description: 'Семена расположены по спирали Фибоначчи',
      ratio: 'Угол между семенами ≈ 137.5°',
      image: 'https://picsum.photos/seed/sunflower/600/400'
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Icon name="Calculator" size={18} />
              Калькулятор
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Расчёт пропорций</h2>
                    <p className="text-gray-600">Введите число для расчёта золотого сечения</p>
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
                        min="1"
                      />
                    </div>

                    <div className="space-y-4 pt-6">
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

              <Card className="p-8 bg-gradient-to-br from-amber-50 to-yellow-50">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Золотая спираль</h2>
                    <p className="text-gray-600">Визуализация пропорций Фибоначчи</p>
                  </div>
                  <div className="flex justify-center items-center">
                    <img
                      src="https://cdn.poehali.dev/files/IMG_0642.jpeg"
                      alt="Золотая спираль Фибоначчи"
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                  <div className="pt-4 border-t text-sm text-gray-600 space-y-2">
                    <p><strong>Квадраты Фибоначчи:</strong> каждый квадрат в 1.618 раз больше предыдущего</p>
                    <p><strong>Спираль:</strong> проходит через углы квадратов, образуя идеальную кривую</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>



          <TabsContent value="photo" className="space-y-6">
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Анализ композиции</h2>
                    <p className="text-gray-600">Загрузите фото, двигайте его мышкой для точной композиции</p>
                  </div>
                  {uploadedImage && (
                    <Button
                      onClick={downloadCanvas}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Icon name="Download" size={18} />
                      Сохранить
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 items-center justify-center">
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
                    <div className="flex gap-6 items-center justify-center">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="spiral-toggle"
                          checked={showSpiral}
                          onCheckedChange={setShowSpiral}
                        />
                        <Label htmlFor="spiral-toggle">Спираль</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="grid-toggle"
                          checked={showGrid}
                          onCheckedChange={setShowGrid}
                        />
                        <Label htmlFor="grid-toggle">Сетка</Label>
                      </div>
                    </div>
                  )}
                </div>

                {uploadedImage && (
                  <div className="bg-gray-50 rounded-lg p-4 flex justify-center">
                    <canvas
                      ref={imageCanvasRef}
                      className="max-w-full rounded shadow-lg cursor-move"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  </div>
                )}

                <div className="pt-4 border-t text-sm text-gray-600 space-y-2">
                  <p><strong>Линии сетки:</strong> размещайте ключевые элементы на пересечениях золотых линий</p>
                  <p><strong>Спираль:</strong> показывает естественное направление взгляда по композиции</p>
                  <p><strong>Управление:</strong> перетаскивайте фото мышкой для точной настройки композиции</p>
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
                      loading="lazy"
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