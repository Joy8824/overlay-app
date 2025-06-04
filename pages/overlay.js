import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-2xl shadow-md ${className}`}>{children}</div>
);

const CardContent = ({ children, className }) => (
  <div className={`p-6 space-y-4 ${className}`}>{children}</div>
);


/**
 * Overlay Approval Preview Page
 *
 */
export default function Overlay() {
  const router = useRouter();
  const { sessionId } = router.query;

  const [items, setItems] = useState([]); // array of overlay objects
  const [index, setIndex] = useState(0); // carousel index
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// Fetch overlay info for this sessionId
useEffect(() => {
  console.log('sessionId:', sessionId); //
  if (!sessionId) return;
  const fetchData = async () => {
    try {
      const res = await fetch('/api/overlay-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("Failed to load overlay data");
      const json = await res.json();
      setItems(json);
      console.log(items) // testing array response
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [sessionId]);

  const current = items[index] ?? {};

  const next = () => setIndex((prev) => (prev + 1) % items.length);
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);

  if (loading) return <p className="text-center mt-10">Loading overlay…</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
  if (!items.length) return <p className="text-center mt-10">No overlay data found.</p>;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Approve / Reject buttons – functions wired later */}
      <div className="flex justify-end gap-4 mb-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded-2xl shadow hover:opacity-90" disabled>
          Approve
        </button>
        <button className="bg-red-600 text-white px-4 py-2 rounded-2xl shadow hover:opacity-90" disabled>
          Reject
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Carousel */}
  <div className="md:col-span-2 relative">
  {/* Arrows */}
  {items.length > 1 && (
    <>
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 shadow"
        onClick={prev}
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 shadow"
        onClick={next}
      >
        <ArrowRight className="w-5 h-5" />
      </button>
    </>
  )}

  <AnimatePresence mode="wait" initial={false}>
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-2xl shadow-md overflow-hidden"
    >
      <img
        src={current.overlayImageUrl || current.customerFileUrl}
        alt={current.fileName}
        className="w-full object-contain max-h-[500px]"
      />
    </motion.div>
  </AnimatePresence>
</div>



        {/* Sidebar */}
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">File Details</h3>
            <p><span className="font-medium">File:</span> {current.fileName}</p>
            <p><span className="font-medium">Product:</span> {current.productName}</p>
            {/* Additional metadata can be added here */}
            <div className="space-x-2 mt-4 hidden">{/* Hidden until wired up */}
              <button className="bg-green-600 text-white px-3 py-1.5 rounded-xl">Approve</button>
              <button className="bg-red-600 text-white px-3 py-1.5 rounded-xl">Reject</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
