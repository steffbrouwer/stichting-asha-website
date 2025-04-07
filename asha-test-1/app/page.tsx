import Image from "next/image";

export default function Home() {
  return (
    <div className="container mx-auto py-10 px-4">
      {/* Banner */}
      <div className="relative h-64 mb-10 rounded-lg overflow-hidden">
        <Image
          src="https://lh3.googleusercontent.com/p/AF1QipMlGdHeAQdXojmP1eccxTqXot7s8GbXpMFYugMM=s680-w680-h510"
          alt="Stichting Asha Banner"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white px-6 py-2 rounded">
            Stichting Asha
          </h1>
        </div>
      </div>

      {/* Introduction */}
      <div className="mb-10">
        <p className="text-gray-700">
          Stichting Asha (Asha = Hoop in het Hindi) is een vrijwilligersorganisatie van Surinaamse Hindostanen in de gemeente Utrecht. De organisatie is in 1976 opgericht en wil met haar activiteiten een positieve bijdrage leveren aan het gemeentelijke integratie- en participatiebeleid.
        </p>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Visie */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Visie</h2>
          <p className="text-gray-700">
            Stichting Asha vindt het belangrijk dat de Hindostaanse gemeenschap in Utrecht de eigen cultuur en identiteit beleeft. Zo kunnen de leden van de gemeenschap de kracht opdoen om zich verder te ontwikkelen. Bovendien bevordert cultuur- en identiteitsbeleving een vlotte inburgering in de Nederlandse samenleving.
          </p>
        </div>

        {/* Missie */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Missie</h2>
          <p className="text-gray-700">
            Door het organiseren van projecten en activiteiten voor de Hindostaanse gemeenschap en andere groepen in de Utrechtse samenleving, wil Stichting Asha een bijdrage leveren aan de multiculturele samenleving. Samenwerkingen met de gemeente, onderwijsinstellingen, het bedrijfsleven en welzijnsorganisaties is daardoor essentieel.
          </p>
        </div>

        {/* Media */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-secondary mb-4">Media</h2>
          <p className="text-gray-700">
            Stichting Asha wordt voortdurend door de Media benaderd. Met name de projecten sollicitatie Helpdesk, ouderen en huiswerkbegeleiding haalt veelvuldig de media. Verder zijn de praktijkvoorbeelden interessant, een verzameling daarvan ziet u bij onze projecten.
          </p>
        </div>
      </div>
    </div>
  );
}