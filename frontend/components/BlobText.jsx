import React from 'react'
import { useEffect } from 'react'

export default function BlobText({ children, className }) {
    
    return (
        <div>
            <section className={`${className}`}>
                <div className="content">
                    <h2>{children}</h2>
                    <h2>{children}</h2>
                </div>
            </section>
            <style jsx>
                {`
                    
                    @import url("https://fonts.googleapis.com/css?family=Poppins:100,200,300,400,500,600,700,800,900");

* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: "Poppins", sans-serif;
}

body {
	display: flex;
	background: #000;
	
	align-items: center;
	justify-content: center;
}

.content {
	position: relative;
}

.content h2 {
	color: #fff;
	
	position: absolute;
	transform: translate(0%,-100%);
}

.content h2:nth-child(1) {
	color: transparent;
	-webkit-text-stroke: 2px #000000;
}

.content h2:nth-child(2) {
	color: #000000;
	animation: animate 4s ease-in-out infinite;
}

@keyframes animate {
	0%,
	100% {
		clip-path: polygon(
			0% 45%,
			16% 44%,
			33% 50%,
			54% 60%,
			70% 61%,
			84% 59%,
			100% 52%,
			100% 100%,
			0% 100%
		);
	}

	50% {
		clip-path: polygon(
			0% 60%,
			15% 65%,
			34% 66%,
			51% 62%,
			67% 50%,
			84% 45%,
			100% 46%,
			100% 100%,
			0% 100%
		);
	}
}

                `}
            </style>
        </div>
    )
}
