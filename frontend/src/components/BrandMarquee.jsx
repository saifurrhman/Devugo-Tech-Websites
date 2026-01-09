import React, { useEffect, useState } from 'react';
import { BrandAPI } from '../lib/api';

export default function BrandMarquee() {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await BrandAPI.list({ active: true });
                setBrands(data || []);
            } catch (e) {
                console.error(e);
            }
            setLoading(false);
        }
        load();
    }, []);

    if (loading || brands.length === 0) return null;

    // Duplicate list to ensure seamless scroll
    // If list is small (e.g. < 5), tripling it helps fill width
    const displayBrands = [...brands, ...brands, ...brands, ...brands];

    return (
        <section className="py-12">
            <div className="container mx-auto px-4 mb-16 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                    Trusted by innovative companies
                </h2>
            </div>

            <div className="brand-marquee-container">
                <div className="brand-marquee-content">
                    {displayBrands.map((brand, i) => (
                        <div key={`${brand._id}-${i}`} className="brand-item">
                            {brand.url ? (
                                <a href={brand.url} target="_blank" rel="noreferrer" title={brand.name}>
                                    <img src={brand.logo} alt={brand.name} />
                                </a>
                            ) : (
                                <img src={brand.logo} alt={brand.name} title={brand.name} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
