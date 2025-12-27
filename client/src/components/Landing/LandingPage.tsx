import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Clock, Shield, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-800">San Marimar</h1>
            <Button onClick={onGetStarted} variant="outline">
              Ingresar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Ahorro Colaborativo <span className="text-blue-600">Inteligente</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Únete a nuestro sistema de cadenas y juntas colaborativas. Ahorra de manera organizada y
            alcanza tus metas financieras junto a otros usuarios.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            Comenzar Ahora
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona San Marimar?</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nuestro sistema de ahorro colaborativo te permite participar en grupos organizados donde
            cada miembro contribuye regularmente hasta completar el objetivo común.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Grupos Colaborativos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Únete a grupos de ahorro con personas que comparten tus objetivos financieros.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Aportes Regulares</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Realiza contribuciones mensuales o quincenales según el plan elegido.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Turnos Organizados</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Recibe tu retorno según el turno asignado por sorteo transparente.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Seguro y Confiable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sistema transparente con seguimiento completo de todos los movimientos.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Proceso Simple en 4 Pasos
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Regístrate</h4>
              <p className="text-gray-600">Crea tu cuenta y completa tu perfil para comenzar.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Elige un Producto</h4>
              <p className="text-gray-600">
                Selecciona el plan de ahorro que mejor se adapte a tus necesidades.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Únete a un Grupo</h4>
              <p className="text-gray-600">
                Participa en un grupo activo o espera a que se forme uno nuevo.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">Ahorra y Recibe</h4>
              <p className="text-gray-600">
                Realiza tus aportes y recibe tu retorno según tu turno asignado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">¿Listo para comenzar tu ahorro colaborativo?</h3>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de usuarios que ya están ahorrando de manera inteligente con San Marimar.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            variant="secondary"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
          >
            Comenzar Mi Ahorro
            <ArrowRight className="ml-2" size={20} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h4 className="text-2xl font-bold mb-2">San Marimar</h4>
          <p className="text-gray-400">
            Sistema de ahorro colaborativo - Construyendo tu futuro financiero juntos
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
