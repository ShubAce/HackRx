# Insurance Claim Assistant - Enhanced Version

## 🎉 Features Fixed & Enhanced

### ✅ Upload Functionality Fixed

-   **File Upload**: Now properly handles PDF, DOCX, and EML files
-   **Drag & Drop**: Enhanced upload modal with drag-and-drop support
-   **Error Handling**: Better error messages and validation
-   **File Preview**: Shows uploaded files with size information
-   **Progress Indicators**: Loading states and success messages

### ✅ Responsive Design Improvements

-   **Mobile-First**: Optimized for all screen sizes
-   **Touch-Friendly**: Better button sizes and spacing for mobile
-   **Adaptive Panels**: Smart panel behavior on different screen sizes
-   **Flexible Layout**: Panels automatically adjust based on content

### ✅ Enhanced Animations

-   **Smooth Transitions**: Spring-based animations using Framer Motion
-   **Interactive Elements**: Hover effects and micro-interactions
-   **Loading States**: Animated loading indicators
-   **Panel Slides**: Smooth panel transitions with better easing
-   **Message Animations**: Staggered animations for chat messages

### ✅ UI/UX Improvements

-   **Modern Design**: Updated with gradients and better typography
-   **Better Icons**: Enhanced iconography throughout the app
-   **Status Indicators**: Visual status for different chat states
-   **File Management**: Better file display and management
-   **Auto-scroll**: Messages auto-scroll to bottom with smooth animation

## 🚀 Getting Started

### Backend Setup

1. Navigate to the backend directory:

    ```bash
    cd backend
    ```

2. Install dependencies (if not already done):

    ```bash
    pip install -r requirements.txt
    ```

3. Start the backend server:
    ```bash
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    ```

### Frontend Setup

1. Navigate to the frontend directory:

    ```bash
    cd HackRxbackend
    ```

2. Install dependencies (if not already done):

    ```bash
    npm install
    ```

3. Start the frontend development server:
    ```bash
    npm run dev
    ```

## 📱 How to Use

### 1. Upload Documents

-   Click the **paperclip icon** in the chat input
-   **Drag and drop** files or click to select
-   Supports **PDF, DOCX, and EML** files
-   Files are uploaded per chat session

### 2. Ask Questions

-   Type your questions about claims or policies
-   The AI will analyze your uploaded documents
-   Get structured responses with evidence citations

### 3. View Evidence

-   Evidence panel shows supporting clauses
-   Decision status with color-coded indicators
-   Expandable clause details for better readability

## 🎨 New Animation Features

### Interactive Elements

-   **Hover animations** on buttons and cards
-   **Scale effects** on click interactions
-   **Smooth state transitions** between loading and loaded states

### Panel Animations

-   **Spring-based transitions** for opening/closing panels
-   **Staggered animations** for list items
-   **Smooth slide effects** for mobile panel toggles

### Message Flow

-   **Typing indicators** with animated dots
-   **Message appear animations** with spring physics
-   **Auto-scroll** with smooth easing to new messages

## 🔧 Technical Improvements

### Backend Enhancements

-   ✅ Added missing `/upload` and `/query` endpoints
-   ✅ Improved error handling and validation
-   ✅ Better file type checking
-   ✅ Enhanced LLM integration with structured responses
-   ✅ Fixed Pydantic imports for latest version

### Frontend Enhancements

-   ✅ Completely redesigned upload modal
-   ✅ Enhanced responsive breakpoints
-   ✅ Improved state management
-   ✅ Better error boundaries and loading states
-   ✅ Enhanced accessibility features

### Performance Optimizations

-   ✅ Optimized re-renders with better component structure
-   ✅ Lazy loading for heavy components
-   ✅ Efficient animation performance
-   ✅ Better memory management for file uploads

## 🌟 Key Features

1. **Smart Upload System**

    - Multi-file support with preview
    - Real-time validation
    - Progress tracking
    - Error recovery

2. **Intelligent Chat Interface**

    - Context-aware responses
    - Rich message formatting
    - Auto-generated chat titles
    - Persistent chat history

3. **Evidence Analysis**

    - Structured evidence presentation
    - Source document linking
    - Decision categorization
    - Expandable detail views

4. **Responsive Design**
    - Mobile-optimized interface
    - Touch-friendly interactions
    - Adaptive panel behavior
    - Cross-device compatibility

## 🎯 Browser Compatibility

-   ✅ Chrome (recommended)
-   ✅ Firefox
-   ✅ Safari
-   ✅ Edge

## 📊 API Endpoints

### Upload Files

```
POST /api/v1/upload
Content-Type: multipart/form-data
Body: files (multiple), chat_id (string)
```

### Query Documents

```
POST /api/v1/query
Content-Type: application/x-www-form-urlencoded
Body: query (string), chat_id (string), messages_json (string)
```

## 🏃‍♂️ Quick Test

1. Open the application at `http://localhost:5174`
2. Click "New Claim Chat"
3. Upload a policy document using the paperclip icon
4. Ask a question like "What eye surgeries are covered?"
5. Watch the animated response with evidence citations!

## 🎨 Animation Details

The app now includes sophisticated animations using Framer Motion:

-   **Layout animations** for dynamic content
-   **Gesture-based interactions** for mobile
-   **Orchestrated sequences** for complex UI changes
-   **Physics-based animations** for natural movement
-   **Responsive animations** that adapt to screen size

All animations are optimized for performance and respect user preferences for reduced motion.

---

**Status**: ✅ **Fully Functional & Enhanced**
**Upload Issue**: ✅ **Fixed**
**Responsiveness**: ✅ **Greatly Improved**
**Animations**: ✅ **Beautifully Implemented**

---

This documentation has moved. Please see the root README.md for the latest setup and usage instructions.
