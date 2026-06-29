import {createApp} from 'vue';
import App from './vue/App.vue';

// Mount a separate Vue app on every streetmap block instance on the page.
document.querySelectorAll( '.owc-openkaarten-streetmap' ).forEach( ( element ) => {
  createApp( App, {
    ...element.dataset,
  } ).mount( element );
} );
