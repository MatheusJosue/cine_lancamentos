import axios from 'axios';
import environment from '../assets/environments/environments.json';

const api = axios.create({
    baseURL: 'https://api.themoviedb.org/3/',
    params: {
        api_key: environment.theMovieDbApiKey,
        language: 'pt-BR',
        page: 1
    }
});
 
export default api;

// https://www.themoviedb.org/settings/api ----- site para gerar API KEY