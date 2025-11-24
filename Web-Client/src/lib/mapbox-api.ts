/**
 * Servicio para interactuar con las APIs de Mapbox
 */

export interface GeocodingFeature {
  id: string;
  type: 'Feature';
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
    address?: string;
    category?: string;
    landmark?: boolean;
    maki?: string;
    tel?: string;
    wikidata?: string;
    short_code?: string;
  };
  text: string;
  place_name: string;
  bbox?: [number, number, number, number];
  center: [number, number];
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

export interface GeocodingResponse {
  type: 'FeatureCollection';
  query: string[];
  features: GeocodingFeature[];
  attribution: string;
}

class MapboxAPIService {
  private accessToken: string;
  private baseUrl = 'https://api.mapbox.com';
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly rateLimit = 600; // requests per minute for free tier
  private readonly rateLimitWindow = 60 * 1000; // 1 minute in milliseconds

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Verifica y aplica límites de tasa para las llamadas a la API
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset counter if window has passed
    if (now - this.lastRequestTime > this.rateLimitWindow) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    // Check if we're within rate limits
    if (this.requestCount >= this.rateLimit) {
      const waitTime = this.rateLimitWindow - (now - this.lastRequestTime);
      throw new Error(`Límite de tasa excedido. Espera ${Math.ceil(waitTime / 1000)} segundos antes de intentar nuevamente.`);
    }

    this.requestCount++;
  }

  /**
   * Busca direcciones o lugares usando la Geocoding API
   * @param query - Término de búsqueda
   * @param options - Opciones adicionales de búsqueda
   * @returns Promise con los resultados de geocoding
   */
  async geocode(
    query: string,
    options: {
      limit?: number;
      country?: string;
      bbox?: [number, number, number, number];
      proximity?: [number, number];
      types?: string[];
      autocomplete?: boolean;
    } = {}
  ): Promise<GeocodingResponse> {
    // Verificar límites de tasa antes de hacer la petición
    await this.checkRateLimit();

    const params = new URLSearchParams();
    params.set('access_token', this.accessToken);

    if (options.limit) params.set('limit', options.limit.toString());
    if (options.country) params.set('country', options.country);
    if (options.autocomplete !== undefined) params.set('autocomplete', options.autocomplete.toString());

    // Convertir arrays a strings separadas por coma
    if (options.types) {
      params.set('types', options.types.join(','));
    }
    if (options.bbox) {
      params.set('bbox', options.bbox.join(','));
    }
    if (options.proximity) {
      params.set('proximity', options.proximity.join(','));
    }

    const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?${params}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.');
        }
        throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
      }

      const data: GeocodingResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error en geocoding:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('No se pudo realizar la búsqueda. Inténtalo de nuevo.');
    }
  }
}

// Instancia singleton del servicio
let mapboxService: MapboxAPIService | null = null;

/**
 * Obtiene la instancia del servicio Mapbox
 */
export function getMapboxService(): MapboxAPIService {
  if (!mapboxService) {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      throw new Error('NEXT_PUBLIC_MAPBOX_TOKEN no está configurado');
    }
    mapboxService = new MapboxAPIService(token);
  }
  return mapboxService;
}

export default MapboxAPIService;