const renderStars = (rating) => {
    const fullStars = Math.floor(rating); // Full stars
    const halfStars = rating % 1 >= 0.5 ? 1 : 0; // One half star if the rating has a .5
    const emptyStars = 5 - fullStars - halfStars; // Total stars minus full and half stars
    const stars = [];
  
    // Add filled stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`filled-${i}`} className="star filled">★</span>);
    }
  
    // Add half star
    if (halfStars) {
      stars.push(<span key="half" className="star half">★</span>);
    }
  
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
  
    return stars;
  };
  
export default renderStars