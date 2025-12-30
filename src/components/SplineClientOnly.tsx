import React, { useEffect, useState } from "react";

type Props = {
  scene: string;
};

export default function SplineClientOnly({ scene }: Props) {
  const [mounted, setMounted] = useState(false);
  const [Spline, setSpline] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // dynamically import the Spline component only in the browser
    import("@splinetool/react-spline")
      .then((mod) => {
        setSpline(() => mod.default || mod);
      })
      .catch(() => {
        setSpline(null);
      });
  }, []);

  if (!mounted || !Spline) return null;

  return <Spline scene={scene} />;
}
