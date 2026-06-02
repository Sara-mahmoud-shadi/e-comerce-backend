import { currentTimestamp } from 'src/utilies/constant';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class SettingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // General
  @Column({ default: 'My Store' })
  siteName: string;

  @Column({ type: 'text', default: 'Best online shopping store' })
  siteDescription: string;

  @Column({ default: 'en' })
  defaultLanguage: string;

  // Media
  @Column({ nullable: true, default: '' })
  logo: string;

  @Column({ nullable: true, default: '' })
  favicon: string;

  // Contact
  @Column({ default: 'info@store.com' })
  storeEmail: string;

  @Column({ default: '+966500000000' })
  storePhone: string;

  @Column({ type: 'text', default: 'Riyadh, Saudi Arabia' })
  storeAddress: string;

  @Column({ default: 'support@store.com' })
  supportEmail: string;

  // SEO
  @Column({ default: 'Best E-Commerce Store' })
  metaTitle: string;

  @Column({ type: 'text', default: 'Online shopping website' })
  metaDescription: string;

  @Column({ default: 'shop, ecommerce, store' })
  keywords: string;

  // Social Media
  @Column({ nullable: true, default: 'https://facebook.com/store' })
  facebookUrl: string;

  @Column({ nullable: true, default: 'https://instagram.com/store' })
  instagramUrl: string;

  @Column({ nullable: true, default: 'https://twitter.com/store' })
  twitterUrl: string;

  @CreateDateColumn({ type: 'timestamp', default: () => currentTimestamp })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => currentTimestamp,
    onUpdate: currentTimestamp,
  })
  updatedAt: Date;
}
