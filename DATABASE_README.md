# Database Setup Guide

Таны апп-д одоогоор hardcoded өгөгдөл ашиглагдаж байна. Supabase database ашиглахын тулд дараах алхмуудыг дагана уу.

## 1. Supabase Project үүсгэх

1. [supabase.com](https://supabase.com) дээр бүртгүүлэх
2. New Project үүсгэх
3. Project details оруулах

## 2. Environment Variables тохируулах

`.env.example` файлыг `.env.local` болгон хуулж, бодит утгуудыг оруулна:

```bash
cp .env.example .env.local
```

Дараа нь `.env.local` файлд Supabase-н URL болон API key-үүдийг оруулна.

## 3. Database Schema үүсгэх

Supabase Dashboard → SQL Editor руу ороод `database_schema.sql` файлын агуулгыг ажиллуулна.

## 4. TypeScript Types ашиглах

`lib/supabase.ts` файлд database table-н TypeScript interface-үүд тодорхойлогдсон байна.

## Database Tables

### Users (хэрэглэгчид)
- Хэрэглэгчийн мэдээлэл хадгална
- Role: admin, director, manager, employee

### Tasks (даалгавар)
- Даалгавруудын мэдээлэл
- Status: Эхэлсэн, Зассан, Эсхийг

### Fulfillments (биелүүлэлт)
- Биелүүлэлтийн мэдээлэл
- Status: Илгээсэн, Баталгаажсан, Буцаасан

### Meetings (хурал)
- Хурлын мэдээлэл
- Status: Эхэлсэн, Зассан, Эсхийг

## Жишээ ашиглалт

```typescript
import { supabase } from '@/lib/supabase'

// Tasks авах
const { data: tasks, error } = await supabase
  .from('tasks')
  .select('*')
  .eq('assigned_to', userId)

// Task шинэчлэх
const { data, error } = await supabase
  .from('tasks')
  .update({ status: 'Зассан' })
  .eq('id', taskId)
```

## Migration

Ирээдүйд өгөгдлийн бүтэц өөрчлөгдвөл migration файлууд үүсгэж болно.