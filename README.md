# 🎨 Picto - AI-Powered Online Photo Editor

> **Next.js, Convex, 그리고 AI를 활용한 실시간 웹 이미지 에디터 서비스**

![Project Banner](public/preview.gif) 

**[🚀 배포 링크 바로가기 (Live Demo)](https://picto-image-editing.vercel.app)**

## 📖 프로젝트 소개 (Introduction)
**Picto**는 누구나 쉽고 빠르게 이미지를 편집할 수 있는 SaaS 기반 웹 에디터입니다.
단순한 자르기/회전 기능을 넘어, **Generative AI**를 활용한 배경 제거, 이미지 확장(Outpainting), 객체 제거 기능을 제공합니다. 별도의 설치 없이 웹에서 즉시 실행되며, 모든 작업 내역은 클라우드에 실시간으로 저장됩니다.

## 🛠️ 기술 스택 (Tech Stack)

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** JavaScript / TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Canvas Engine:** Fabric.js v6
- **State Management:** React Context API, Zustand

### Backend & Database
- **BaaS (Backend-as-a-Service):** Convex (Real-time DB & Functions)
- **Authentication:** Clerk
- **Storage & AI Processing:** ImageKit

### Tools & Deployment
- **Deployment:** Vercel
- **Internationalization:** next-intl (English/Korean)

---

## 📂 폴더 구조 (Folder Structure)

```bash
├── app
│   ├── [locale]          # 다국어(i18n) 지원을 위한 라우트 (en/ko)
│   │   ├── (auth)        # 로그인/회원가입 (Clerk)
│   │   ├── (main)        # 메인 어플리케이션 (Dashboard, Editor)
│   │   └── api           # Next.js API Routes (ImageKit 업로드 등)
├── convex                # Convex 백엔드 함수 (DB Schema, Queries, Mutations)
├── components
│   ├── ui                # 재사용 가능한 UI 컴포넌트 (Button, Slider 등)
│   └── ...               # 기능별 컴포넌트 (Editor, Dashboard)
├── hooks                 # 커스텀 훅 (useCanvas, useConvexQuery 등)
├── messages              # 다국어 번역 JSON 파일
└── public                # 정적 리소스 (Images, Icons)
```
---

## 🚀 실행 방법 (Getting Started)

이 프로젝트는 로컬 환경에서 실행하기 위해 **Convex**와 **Next.js**가 모두 실행되어야 합니다.

**1. 저장소 클론 (Clone Repository)**

```bash
git clone [https://github.com/your-username/picto.git](https://github.com/your-username/picto.git)
cd picto

```

**2. 패키지 설치 (Install Dependencies)**

```bash
npm install

```

**3. 환경 변수 설정 (Environment Variables)**
루트 디렉토리에 `.env.local` 파일을 생성하고 다음 키값들을 입력해주세요.

```env
# Convex
CONVEX_DEPLOYMENT=generated_by_npx_convex_dev
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# ImageKit (AI & Storage)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

```

**4. 백엔드 실행 (Run Convex)**
별도의 터미널에서 실행하여 백엔드 함수를 동기화합니다.

```bash
npx convex dev

```

**5. 프론트엔드 실행 (Run Next.js)**

```bash
npm run dev

```

브라우저에서 `http://localhost:3000`으로 접속하여 확인하세요!



