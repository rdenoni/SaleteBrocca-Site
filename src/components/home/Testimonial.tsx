import Image from "next/image";
import type { Testimonial as TestimonialData } from "@/types/content";
import styles from "./Testimonial.module.css";

interface TestimonialProps {
  testimonial: TestimonialData;
}

export function Testimonial({ testimonial }: TestimonialProps) {
  return (
    <figure className={styles.figure}>
      <blockquote className={styles.quote}>
        <p>{testimonial.quote}</p>
      </blockquote>
      <figcaption className={styles.author}>
        <Image src={testimonial.photo} alt="" width={128} height={128} className={styles.photo} />
        <span>
          <span className={styles.name}>{testimonial.author}</span>
          <span className={styles.role}>{testimonial.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}
