"use client"

import React, { useEffect, useRef, useState } from 'react'

const useIntersectionObserver = (thereshold = 0.1) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { thereshold })


        if (ref.current) observer.observe(ref.current)
    }, [thereshold])

    return [ref, isVisible]
}

export default useIntersectionObserver
