import {createRoot} from 'react-dom/client';
import LiquidGlassDemo from '@/components/liquid-glass-demo';
import './style.css';

// Standalone page showing Aceternity's liquid glass demo unchanged, for comparison with the cursor.
createRoot(document.getElementById('root')).render(<LiquidGlassDemo/>);
