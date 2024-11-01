import MapContainer from './components/MapContainer';
import ReviewSync from './components/ReviewSync';

export default function Home() {
  return (
    <main>
      <ReviewSync />
      <MapContainer />
    </main>
  );
}