import { CountryManager } from './CountryManager.js';
import { TerritoryManager } from './TerritoryManager.js';
import { BorderManager } from './BorderManager.js';
import { InfrastructureManager } from './InfrastructureManager.js';
export class WorldHubService {
  constructor() { this.countries = new CountryManager(); this.territories = new TerritoryManager(); this.borders = new BorderManager(); this.infrastructure = new InfrastructureManager({ territories: this.territories }); }
  dashboard(userId) {
    const country = this.countries.memberCountry(userId);
    const owned = country ? this.territories.byCountry(country.id).filter((x) => x.owner_country_id === country.id) : [];
    const controlled = country ? this.territories.byCountry(country.id).filter((x) => x.controller_country_id === country.id) : [];
    return { countries: this.countries.list().length, territories: this.territories.list().length, neutral: this.territories.neutral().length, borders: this.borders.listEdges().length, country, owned: owned.length, controlled: controlled.length, infrastructure_score: owned.reduce((s, t) => s + this.infrastructure.score(t.id), 0) };
  }
}
