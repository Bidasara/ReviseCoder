import './App.css'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/home.jsx'
import Login from './pages/login.jsx'
import Register from './pages/register.jsx'
import Layout from './Layout.jsx'
import PricePage from './pages/price.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import Dashboard from './pages/dashboard.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import { ProblemProvider } from './contexts/ProblemContext.jsx'
import { SpriteAnimationProvider } from './contexts/SpriteAnimationContext.jsx'
import { BreakAnimationProvider } from './contexts/BreakAnimationContext.jsx'
import CheckoutPage from './pages/checkout.jsx'
import BrowsePage from './pages/browse.jsx'
import MilestonesPage from './pages/milestone.jsx'
import ResetPassword from './pages/resetPassword.jsx'
import GetEmail from './pages/getEmail.jsx'
import { NoteModalProvider } from './contexts/NoteModalContext.jsx'
import { ModalProvider } from './contexts/ModalContext.jsx'
import { ScrollProvider } from './contexts/ScrollContext.jsx'
import Homepage from './pages/HomePage.jsx'
import RotateDeviceOverlay from './components/common/RotateDeviceOverlay.jsx'

function App() {
 return (
  <NotificationProvider>
   <Router>
    <Routes>
     <Route path='/' element={<Homepage />} />
     <Route path="/user/:username" element={
         <ThemeProvider>
       <SpriteAnimationProvider>
        <BreakAnimationProvider>
         <ScrollProvider>
          <AuthProvider>
           <NoteModalProvider>
            <ModalProvider>
             <ProblemProvider>
              <Dashboard />
             </ProblemProvider>
            </ModalProvider>
           </NoteModalProvider>
          </AuthProvider>
         </ScrollProvider>
        </BreakAnimationProvider>
       </SpriteAnimationProvider>
      </ThemeProvider>
     } />
     <Route path="/*" element={
         <div className="min-h-screen w-full grid place-items-center bg-zinc-900 p-4">
             <RotateDeviceOverlay/>
       <div
        className="relative overflow-hidden rounded-lg shadow-2xl bg-white"
        style={{
         width: 'min(95vw, calc(95vh * 16/9))',
         height: 'min(95vh, calc(95vw * 9/16))',
         aspectRatio: '16/9',
         containerType: 'size'
        }}
       >
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
         <div id="notification-root"></div>
         <div id="modal-root"></div>

         <ThemeProvider>
          <SpriteAnimationProvider>
           <BreakAnimationProvider>
            <ScrollProvider>
             <AuthProvider>
              <NoteModalProvider>
               <ModalProvider>
                <ProblemProvider>
                 <Routes>
                  <Route element={<Layout />}>
                   <Route path='/home' element={<Home />} />
                   <Route path='/shop' element={<PricePage />} />
                   <Route path='/checkout' element={<CheckoutPage />} />
                   <Route path='/library' element={<BrowsePage />} />
                   <Route path='/milestones' element={<MilestonesPage />} />
                  </Route>
                  <Route path='/login' element={<Login />} />
                  <Route path='/getEmail' element={<GetEmail />} />
                  <Route path='/resetPass' element={<ResetPassword />} />
                  <Route path='/register' element={<Register />} />
                 </Routes>
                </ProblemProvider>
               </ModalProvider>
              </NoteModalProvider>
             </AuthProvider>
            </ScrollProvider>
           </BreakAnimationProvider>
          </SpriteAnimationProvider>
         </ThemeProvider>
        </div>
       </div>
      </div>
     } />
    </Routes>
   </Router>
  </NotificationProvider>
 )
}

export default App
