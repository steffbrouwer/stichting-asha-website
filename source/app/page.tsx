"use client";

import Image from "next/image";
import { FolderKanban, Calendar, AlertTriangle, ChevronLeft, ChevronRight, CircleAlert} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";

// Define the NoticeType interface
interface NoticeType {
  _id: string;
  title: string;
  message: string;
  roles: string[];
  expirationDate: string;
  author: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define Project interface
interface Project {
  _id: string;
  title: string;
  description: string;
  image?: {
    contentType: string;
    data: string;
  };
  projectDate: string;
}

// Define Photo interface
interface Photo {
  _id: string;
  title: string;
  description?: string;
  image: {
    data: string;
    contentType: string;
  };
}

// Define CarouselItem interface for unified handling
interface CarouselItem {
  type: 'project' | 'photo';
  id: string;
  title: string;
  description?: string;
  imageData?: string;
  imageContentType?: string;
  date?: string;
}

interface PartnerLogo {
  id: number;
  src: string;
  alt: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notice, setNotice] = useState<NoticeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carousel states
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);
  const [carouselLoading, setCarouselLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselError, setCarouselError] = useState<string | null>(null);

  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);
  const [partnerLogosLoading, setPartnerLogosLoading] = useState(true);
  const [partnerLogosError, setPartnerLogosError] = useState<string | null>(null);

  // Fetch notice on component mount
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notices/latest');
        
        if (!response.ok) {
          throw new Error('Failed to fetch latest notice');
        }
        
        const data = await response.json();
        if (data) {
          setNotice(data);
        }
      } catch (err) {
        console.error('Error fetching notice:', err);
        setError('Could not load notice');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotice();
  }, []);

  // Fetch projects and photos for carousel
  useEffect(() => {
    const fetchCarouselContent = async () => {
      try {
        setCarouselLoading(true);
        
        // Fetch projects
        const projectsResponse = await fetch('/api/projects');
        if (!projectsResponse.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData: Project[] = await projectsResponse.json();
        
        // Fetch photos
        const photosResponse = await fetch('/api/photos');
        if (!photosResponse.ok) {
          throw new Error('Failed to fetch photos');
        }
        const photosData: Photo[] = await photosResponse.json();
        
        // Combine and transform data
        const projectItems: CarouselItem[] = projectsData
          .filter(project => project.image && project.image.data)
          .map(project => ({
            type: 'project',
            id: project._id,
            title: project.title,
            description: project.description,
            imageData: project.image?.data,
            imageContentType: project.image?.contentType,
            date: project.projectDate
          }));
        
        const photoItems: CarouselItem[] = photosData.map(photo => ({
          type: 'photo',
          id: photo._id,
          title: photo.title,
          description: photo.description,
          imageData: photo.image.data,
          imageContentType: photo.image.contentType
        }));
        
        // Interleave projects and photos
        const combined: CarouselItem[] = [];
        const maxLength = Math.max(projectItems.length, photoItems.length);
        
        for (let i = 0; i < maxLength; i++) {
          if (i < projectItems.length) combined.push(projectItems[i]);
          if (i < photoItems.length) combined.push(photoItems[i]);
        }
        
        setCarouselItems(combined);
      } catch (err) {
        console.error('Error fetching carousel content:', err);
        setCarouselError('Could not load carousel content');
      } finally {
        setCarouselLoading(false);
      }
    };

    fetchCarouselContent();
  }, []);

  useEffect(() => {
    const fetchPartnerLogos = async () => {
      try {
        setPartnerLogosLoading(true);
        const response = await fetch('/api/partners');
        if (!response.ok) {
          throw new Error('Failed to fetch partner logos');
        }
        const data = await response.json();
        console.log('Fetched partner logos:', data);
        setPartnerLogos(data);
      } catch (err) {
        console.error('Error fetching partner logos:', err);
        setPartnerLogosError('Could not load partner logos');
      } finally {
        setPartnerLogosLoading(false);
      }
    };
  
    fetchPartnerLogos();
  }, []);

  // Carousel navigation
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (carouselItems.length > 0) {
      const interval = setInterval(goToNext, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselItems.length]);

  // Handle carousel item click
  const handleCarouselItemClick = (item: CarouselItem) => {
    if (item.type === 'project') {
      router.push(`/projecten?id=${item.id}`);
    } else {
      router.push('/fotoboek');
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#F2F2F2]">

      {/* Notice Display */}
      <div className="relative z-20">
        {isLoading ? (
          <div className="p-4 sm:p-6 max-w-sm sm:max-w-xl mx-auto bg-gray-100 rounded-md shadow-md mt-6 sm:mt-10 animate-pulse">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-2 sm:mb-3"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ) : error ? (
          <p className="text-center text-gray-500 mt-6 sm:mt-10">{error}</p>
        ) : notice ? (
          <div className="p-4 sm:p-6 max-w-sm sm:max-w-xl mx-auto bg-yellow-200 opacity-90 rounded-md shadow-md mt-6 sm:mt-10">
            <h2 className="text-base sm:text-xl font-bold text-yellow-900 flex items-center gap-2 mb-1 sm:mb-2">
              <CircleAlert className="w-4 h-4 sm:w-5 sm:h-5" />
              {notice.title}
            </h2>
            <p className="text-sm sm:text-base text-yellow-800">{notice.message}</p>
            <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-yellow-700 flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
              <span>Verloopt op: {new Date(notice.expirationDate).toLocaleDateString('nl-NL')}</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-6 sm:mt-10"></p>
        )}
      </div>

      {/* SVG Curve Background */}
      <div className="absolute top-0 left-0 md:left-[50px] lg:left-[150px] w-full md:w-[calc(100%+150px)] lg:w-[calc(100%+300px)] h-[400px] md:h-[600px] lg:h-[850px] z-0">
        <svg
          viewBox="0 0 3100 1700"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <clipPath id="clip-curve">
              <path d="M0,0 C0,500 1400,1900 3100,0 L3100,0 L0,0 Z" />
            </clipPath>
          </defs>

          <image
            href="/oase.png"
            x="-290"
            y="-280"
            width="3500"
            height="1800"
            clipPath="url(#clip-curve)"
            preserveAspectRatio="xMidYMid slice"
          />

          <path
            d="M0,0 C0,500 1400,1900 3100,0"
            fill="none"
            stroke="#FFD700"
            strokeWidth="12"
          />
        </svg>
      </div>

      {/* Hoofdinhoud specifiek voor mobiel verder naar beneden geplaatst */}
      <div className="relative w-full z-10 pt-[250px] md:pt-[280px] lg:pt-[400px]">
        {/* Stichting Asha Block */}
        <div className="mx-6 md:ml-[50px] lg:ml-[100px] max-w-[90%] md:max-w-lg lg:max-w-xl mb-10 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E2A78] mb-2 md:mb-4">Stichting Asha</h2>
          <p className="text-sm md:text-base lg:text-lg text-gray-700 mb-4 md:mb-8 leading-relaxed">
            Stichting Asha (Asha betekent 'hoop' in het Hindi) is een vrijwilligersorganisatie van Surinaamse Hindostanen in de gemeente Utrecht.
            Opgericht in 1976, zet de stichting zich in om via haar activiteiten een waardevolle bijdrage te leveren aan het integratie- en participatiebeleid van de gemeente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button
              onClick={() => router.push("/projecten")}
              className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 md:py-3 px-4 md:px-5 rounded-md text-sm md:text-base transition-all"
            >
              <FolderKanban className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              Projecten
            </button>
            <button
              onClick={() => router.push("/agenda")}
              className="flex items-center justify-center gap-2 border border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white font-semibold py-2 md:py-3 px-4 md:px-5 rounded-md text-sm md:text-base transition-all"
            >
              <Calendar className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              Agenda
            </button>
          </div>
        </div>

        {/* Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-6 lg:px-10 mt-16 md:mt-24 lg:mt-32 mb-10">
          {/* Visie */}
          <div className="bg-white shadow-lg rounded-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#1E2A78] mb-2 md:mb-4">Visie</h2>
            <p className="text-sm md:text-base text-gray-700">
              Stichting Asha vindt het belangrijk dat de Hindostaanse gemeenschap in Utrecht de eigen cultuur en identiteit beleeft. Zo kunnen de leden van de gemeenschap de kracht opdoen om zich verder te ontwikkelen. Bovendien bevordert cultuur- en identiteitsbeleving een vlotte inburgering in de Nederlandse samenleving.
            </p>
          </div>

          {/* Missie */}
          <div className="bg-white shadow-lg rounded-lg p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold text-[#1E2A78] mb-2 md:mb-4">Missie</h2>
            <p className="text-sm md:text-base text-gray-700">
              Door het organiseren van projecten en activiteiten voor de Hindostaanse gemeenschap en andere groepen in de Utrechtse samenleving, wil Stichting Asha een bijdrage leveren aan de multiculturele samenleving. Samenwerkingen met de gemeente, onderwijsinstellingen, het bedrijfsleven en welzijnsorganisaties is daardoor essentieel.
            </p>
          </div>

          {/* Media */}
          <div className="bg-white shadow-lg rounded-lg p-4 md:p-6 md:col-span-2 lg:col-span-1">
            <h2 className="text-xl md:text-2xl font-semibold text-[#1E2A78] mb-2 md:mb-4">Media</h2>
            <p className="text-sm md:text-base text-gray-700">
              Stichting Asha wordt voortdurend door de Media benaderd. Met name de projecten sollicitatie Helpdesk, ouderen en huiswerkbegeleiding haalt veelvuldig de media. Verder zijn de praktijkvoorbeelden interessant, een verzameling daarvan ziet u bij onze projecten.
            </p>
          </div>
        </div>

        {/* Projects and Photos Carousel Banner */}
        <div className="w-full bg-[#2E376E] py-12 md:py-16 mt-62 mb-16">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Projecten & Foto's</h2>
            
            {carouselLoading ? (
              <div className="flex justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            ) : carouselError ? (
              <p className="text-center text-white/80">{carouselError}</p>
            ) : carouselItems.length === 0 ? (
              <p className="text-center text-white/80">Geen projecten of foto's beschikbaar</p>
            ) : (
              <div className="relative">
                {/* Carousel Navigation */}
                <button 
                  onClick={goToPrev}
                  className="absolute top-1/2 left-[-6rem] z-10 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-2 rounded-full text-white"
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <button 
                  onClick={goToNext}
                  className="absolute top-1/2 right-[-6rem] z-10 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-2 rounded-full text-white"
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Carousel Items */}
                <div className="overflow-hidden">
                  <div className="flex flex-wrap md:flex-nowrap gap-6 md:gap-8">
                    {/* Current item */}
                    {carouselItems[currentIndex] && (
                      <div 
                        className="w-full md:w-2/3 bg-white/10 backdrop-blur-md rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                        onClick={() => handleCarouselItemClick(carouselItems[currentIndex])}
                      >
                        <div className="h-64 md:h-80 lg:h-96 overflow-hidden">
                          {carouselItems[currentIndex].imageData && (
                            <img 
                              src={`data:${carouselItems[currentIndex].imageContentType};base64,${carouselItems[currentIndex].imageData}`}
                              alt={carouselItems[currentIndex].title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center mb-2">
                            <span className="bg-yellow-400 text-xs font-medium text-white px-2 py-1 rounded">
                              {carouselItems[currentIndex].type === 'project' ? 'Project' : 'Foto'}
                            </span>
                            {carouselItems[currentIndex].date && (
                              <span className="ml-2 text-white/80 text-sm">
                                {new Date(carouselItems[currentIndex].date).toLocaleDateString('nl-NL')}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white">{carouselItems[currentIndex].title}</h3>
                          {carouselItems[currentIndex].description && (
                            <p className="text-white/80 mt-2 line-clamp-2">{carouselItems[currentIndex].description}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Preview items (only shown on md+ screens) */}
                    <div className="hidden md:flex md:w-1/3 flex-col gap-4">
                      {[
                        (currentIndex + 1) % carouselItems.length,
                        (currentIndex + 2) % carouselItems.length
                      ].map((index) => (
                        <div
                          key={`preview-${carouselItems[index].id}`}
                          className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden cursor-pointer h-[calc(50%-0.5rem)] transition-transform duration-300 hover:scale-[1.02]"
                          onClick={() => setCurrentIndex(index)}
                        >
                          <div className="h-32">
                            {carouselItems[index].imageData && (
                              <img 
                                src={`data:${carouselItems[index].imageContentType};base64,${carouselItems[index].imageData}`}
                                alt={carouselItems[index].title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-white">{carouselItems[index].title}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dots navigation */}
                <div className="flex justify-center mt-6 gap-2">
                  {carouselItems.map((_, index) => (
                    <button
                      key={`dot-${index}`}
                      className={`h-2 rounded-full transition-all ${index === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Call to action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <button
                onClick={() => router.push("/projecten")}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 px-6 rounded-md transition-all"
              >
                Bekijk alle projecten
              </button>
              <button
                onClick={() => router.push("/fotoboek")}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-md transition-all"
              >
                Ga naar fotoboek
              </button>
            </div>
          </div>
        </div>
        {/* Partner Logos Carousel */}
        <div className="flex items-center justify-center mt-50 mb-10 md:mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E2A78] mb-2">Onze Partners</h2>
        </div>

        <div className="w-full flex justify-center mb-50">
          <div className="partner-logos-container relative w-[80%] overflow-hidden py-5">
            <div className="partner-logos-track flex animate-scroll-x gap-10">
              {partnerLogos.map((logo) => (
                <div
                  key={`logo-${logo.id}`}
                  className="partner-logo flex-shrink-0 w-40 h-20 mx-4 flex items-center justify-center"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}

              {/* Duplicate set */}
              {partnerLogos.map((logo) => (
                <div
                  key={`logo-dup-${logo.id}`}
                  className="partner-logo flex-shrink-0 w-40 h-20 mx-4 flex items-center justify-center"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}