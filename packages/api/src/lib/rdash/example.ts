import { RDashResellerAPI, ApiError } from './index';

const api = new RDashResellerAPI('https://api.rdash.id/v1', 'reseller-id', 'api-key');

try {
  const profile = await api.getProfile();
  console.log(profile.data.name);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`Error ${error.status}: ${error.message}`, error.errors);
  }
}