import React, { useState, useMemo } from 'react';
import "./courses.css";
import { CourseData } from '../../context/CourseContext';
import CourseCard from '../../components/coursecard/courseCard';
import { FaFilter, FaTimes, FaSearch } from 'react-icons/fa';

const Courses = () => {
    const { courses } = CourseData();

    // Filters
    const [searchQ, setSearchQ] = useState('');
    const [priceFilter, setPriceFilter] = useState('all'); // all, free, paid
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Get unique categories
    const categories = useMemo(() => {
        if (!courses) return [];
        const cats = [...new Set(courses.map(c => c.category).filter(Boolean))];
        return cats.sort();
    }, [courses]);

    // Filtered courses
    const filtered = useMemo(() => {
        if (!courses) return [];
        return courses.filter(c => {
            // Search
            if (searchQ.trim()) {
                const q = searchQ.toLowerCase();
                const match = c.title.toLowerCase().includes(q) ||
                    (c.category && c.category.toLowerCase().includes(q)) ||
                    (c.createdBy && c.createdBy.toLowerCase().includes(q));
                if (!match) return false;
            }
            // Price
            if (priceFilter === 'free' && c.price > 0) return false;
            if (priceFilter === 'paid' && c.price <= 0) return false;
            // Category
            if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
            return true;
        });
    }, [courses, searchQ, priceFilter, categoryFilter]);

    const clearFilters = () => {
        setSearchQ('');
        setPriceFilter('all');
        setCategoryFilter('all');
    };

    const hasFilters = searchQ || priceFilter !== 'all' || categoryFilter !== 'all';

    return (
        <div className="courses">
            <h2>Available Courses</h2>

            {/* Search + Filter Bar */}
            <div className="courses-toolbar">
                <div className="courses-search">
                    <FaSearch className="cs-icon" />
                    <input
                        type="text"
                        placeholder="Search courses by title, category..."
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                    />
                </div>
                <button
                    className={`filter-toggle ${filtersOpen ? 'active' : ''}`}
                    onClick={() => setFiltersOpen(!filtersOpen)}
                >
                    <FaFilter /> Filters
                </button>
            </div>

            {/* Filter Panel */}
            {filtersOpen && (
                <div className="filter-panel">
                    <div className="filter-group">
                        <label>Price</label>
                        <div className="filter-chips">
                            {['all', 'free', 'paid'].map(v => (
                                <button
                                    key={v}
                                    className={`filter-chip ${priceFilter === v ? 'active' : ''}`}
                                    onClick={() => setPriceFilter(v)}
                                >
                                    {v === 'all' ? 'All' : v === 'free' ? 'Free' : 'Paid'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Category</label>
                        <div className="filter-chips">
                            <button
                                className={`filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setCategoryFilter('all')}
                            >
                                All
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`filter-chip ${categoryFilter === cat ? 'active' : ''}`}
                                    onClick={() => setCategoryFilter(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    {hasFilters && (
                        <button className="clear-filters" onClick={clearFilters}>
                            <FaTimes /> Clear All Filters
                        </button>
                    )}
                </div>
            )}

            {/* Results Info */}
            {hasFilters && (
                <p className="results-info">
                    Showing {filtered.length} of {courses?.length || 0} courses
                </p>
            )}

            {/* Course Grid or Skeleton */}
            {!courses ? (
                <div className="course-container">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div className="skeleton-card" key={i}>
                            <div className="skeleton-img"></div>
                            <div className="skeleton skeleton-text long"></div>
                            <div className="skeleton skeleton-text short"></div>
                            <div className="skeleton skeleton-text medium"></div>
                            <div className="skeleton skeleton-btn"></div>
                        </div>
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className='course-container'>
                    {filtered.map((e) => (
                        <CourseCard key={e._id} course={e} />
                    ))}
                </div>
            ) : (
                <div className="courses-empty">
                    <span className="empty-icon">🔍</span>
                    <h3>No courses found</h3>
                    <p>Try adjusting your search or filters</p>
                    {hasFilters && (
                        <button className="common-btn" onClick={clearFilters}>Clear Filters</button>
                    )}
                </div>
            )}
        </div>
    )
}

export default Courses;