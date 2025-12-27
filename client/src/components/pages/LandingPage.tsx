import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PublicTemplate } from '@/components/templates';
import { CurrencyDisplay } from '@/components/atoms';
import {
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  DollarSign,
  Clock,
  Target,
  Heart,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

/**
 * Page: Página de inicio/landing
 * Presenta la aplicación y sus beneficios
 *
 * @param onGetStarted - Función llamada cuando el usuario hace clic en "Comenzar"
 * @param onLogin - Función llamada cuando el usuario hace clic en "Iniciar Sesión"
 * @param onRegister - Función llamada cuando el usuario hace clic en "Registrarse"
 */
const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, onRegister }) => {
  const features = [
    {
      icon: Users,
      title: 'Ahorro Colectivo',
      description:
        'Únete a grupos de ahorro colaborativo y alcanza tus metas financieras más rápido.',
    },
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description:
        'Tu dinero está protegido con procesos verificados y administradores certificados.',
    },
    {
      icon: TrendingUp,
      title: 'Interés Competitivo',
      description: 'Obtén mejores rendimientos que en cuentas de ahorro tradicionales.',
    },
    {
      icon: Clock,
      title: 'Pagos Flexibles',
      description: 'Adapta tus pagos mensuales a tu capacidad financiera.',
    },
  ];

  const benefits = [
    'Sin comisiones ocultas',
    'Proceso de aprobación rápido (24-48h)',
    'Soporte al cliente 24/7',
    'Aplicación móvil intuitiva',
    'Reportes detallados de tu progreso',
    'Comunidad de ahorradores activa',
  ];

  const testimonials = [
    {
      name: 'María González',
      text: 'Gracias a Marimar pude comprar mi nevera nueva en solo 6 meses. ¡Increíble!',
      rating: 5,
    },
    {
      name: 'Carlos Rodríguez',
      text: 'El proceso es transparente y seguro. Recomiendo totalmente.',
      rating: 5,
    },
    {
      name: 'Ana López',
      text: 'La mejor decisión financiera que he tomado. Mi grupo es como una familia.',
      rating: 5,
    },
  ];

  return (
    <PublicTemplate onLogin={onLogin} onRegister={onRegister}>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 py-20 lg:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Ahorra Colectivamente,
                <br />
                <span className="text-yellow-300">Alcanza tus Sueños</span>
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                Únete a la revolución del ahorro colaborativo en Venezuela. Compra lo que quieres
                con pagos mensuales accesibles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
                >
                  Comenzar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
                >
                  Ver Productos Disponibles
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Ahorradores Activos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">Bs. 5.000.000</div>
                <div className="text-gray-600">Ahorrados Este Mes</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
                <div className="text-gray-600">Tasa de Éxito</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                ¿Por qué elegir Marimar?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Descubre las ventajas de nuestro sistema de ahorro colaborativo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
              <p className="text-xl text-gray-600">Tres pasos simples para comenzar tu ahorro</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Elige tu producto</h3>
                <p className="text-gray-600">
                  Selecciona el producto que quieres comprar de nuestro catálogo disponible.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 text-white rounded-full text-2xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Únete al grupo</h3>
                <p className="text-gray-600">
                  Forma parte de un grupo de ahorro con personas que quieren el mismo producto.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 text-white rounded-full text-2xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Paga mensualmente</h3>
                <p className="text-gray-600">
                  Realiza tus pagos mensuales y recibe tu producto cuando llegue tu turno.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Beneficios que te encantarán
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Lo que dicen nuestros ahorradores
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">¿Listo para comenzar tu ahorro?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Únete hoy y comienza a construir el futuro que mereces
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg"
            >
              Comenzar Mi Ahorro
              <Heart className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    </PublicTemplate>
  );
};

export default LandingPage;
