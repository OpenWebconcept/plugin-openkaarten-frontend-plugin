import {createApp} from 'vue';
import App from './vue/App.vue';

createApp( App, {
  ...document.getElementById( 'owc-openkaarten-streetmap' ).dataset,
} ).mount( '#owc-openkaarten-streetmap' );
