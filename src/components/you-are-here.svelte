<script lang="ts">
  import { mapContext } from "svelte-maplibre";
  import { getLocation } from "../lib/api";
  import { Popup } from "maplibre-gl";

  const { map } = mapContext();
  let popupCreate = false;

  $: if ($map && !popupCreate) {
    (async () => {
      popupCreate = true;
      const location = await getLocation();
      $map.flyTo({ center: location, zoom: 8 });
      // programmatically creating...
      // could not get Popup component to display inner children
      new Popup({
        closeOnClick: false,
      })
        .setLngLat(location)
        .setHTML("<h3>შენ დაახლოებით აქ ხარ!</h3>")
        .addTo($map);
    })();
  }
</script>
