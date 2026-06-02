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
  site_name: string;

  @Column({ type: 'text', default: 'Best online shopping store' })
  site_description: string;

  @Column({ default: 'en' })
  default_language: string;

  // Media
  @Column({ nullable: true, default: '' })
  logo: string;

  @Column({ nullable: true, default: '' })
  favicon: string;

  // Contact
  @Column({ default: 'info@store.com' })
  store_email: string;

  @Column({ default: '+966500000000' })
  store_phone: string;

  @Column({ type: 'text', default: 'Riyadh, Saudi Arabia' })
  store_address: string;

  @Column({ default: 'support@store.com' })
  support_email: string;

  // SEO
  @Column({ default: 'Best E-Commerce Store' })
  meta_title: string;

  @Column({ type: 'text', default: 'Online shopping website' })
  meta_description: string;

  @Column({ default: 'shop, ecommerce, store' })
  keywords: string;

  // Social Media
  @Column({ nullable: true, default: 'https://facebook.com/store' })
  facebook_url: string;

  @Column({ nullable: true, default: 'https://instagram.com/store' })
  instagram_url: string;

  @Column({ nullable: true, default: 'https://twitter.com/store' })
  twitter_url: string;

  @CreateDateColumn({ type: 'timestamp', default: () => currentTimestamp })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => currentTimestamp,
    onUpdate: currentTimestamp,
  })
  updatedAt: Date;
}
