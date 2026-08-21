import { useEffect, useState } from 'react';

type Props = { target: number; duration?: number; suffix?: string };

export default function AnimatedCounter({ target, duration = 950, suffix = '' }: Props) {
	const [value, setValue] = useState(0);

	useEffect(() => {
		const start = performance.now();
		let frame = 0;
		const tick = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			setValue(Math.round(target * eased));
			if (progress < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [target, duration]);

	return <>{value}{suffix}</>;
}
