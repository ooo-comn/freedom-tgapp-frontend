import { postEvent, retrieveLaunchParams } from '@telegram-apps/sdk'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { initializeUser } from 'src/entities/user/model/createUser'
import { VerificationForm } from 'src/entities/verification/ui/VerificationForm/VerificationForm'
import ConnectCard from 'src/pages/ConnectCard/ConnectCard'
import EditProfile from 'src/pages/EditProfile/EditProfile'
import LegalPage from 'src/pages/LegalPage/LegalPage'
import UserProfile from 'src/pages/UserProfile/ui/UserProfile'
import Create from '../pages/Create/Create'
// import LandingPage from "src/pages/LandingPage/LandingPage";
import RegistrationPage from 'src/pages/RegistrationPage/RegistrationPage'
import SubscriptionPage from 'src/pages/SubscriptionPage/SubscriptionPage'
import SellerProfile from 'src/pages/UserProfile/ui/SellerProfile'
import { WalletWidget } from 'src/widgets/WalletWidget/WalletWidget'
import NavBar from '../pages/Navbar/Navbar'
import ConnectPayments from '../pages/Wallet/ConnectPayments'
import ReturnForm from '../pages/Wallet/ReturnForm'
import useTheme from '../shared/hooks/useTheme'
import './App.css'

function App() {
	const [hasRedirected, setHasRedirected] = useState(false)
	const [userInitialized, setUserInitialized] = useState(false)

	const { theme } = useTheme()
	console.log('theme', theme)

	const navigate = useNavigate()

	useEffect(() => {
		const script = document.createElement('script')
		script.src = 'https://telegram.org/js/telegram-web-app.js'
		script.async = true
		document.body.appendChild(script)

		script.onload = () => {
			console.log('Telegram Web App script loaded')

			if (window.Telegram?.WebApp) {
				const webApp = window.Telegram.WebApp

				webApp.ready()

				webApp.expand()

				if (
					window.Telegram.WebView.initParams.tgWebAppPlatform !== 'tdesktop' &&
					window.Telegram.WebView.initParams.tgWebAppPlatform !== 'macos' &&
					window.Telegram.WebView.initParams.tgWebAppPlatform !== 'weba'
				) {
					postEvent('web_app_request_fullscreen')
				}

				if (webApp.isVerticalSwipesEnabled) {
					webApp.disableVerticalSwipes()
					console.log('Vertical swipes disabled')
				} else {
					console.log('Vertical swipes were already disabled')
				}

				webApp.enableClosingConfirmation()

				// Инициализируем пользователя после загрузки Telegram WebApp
				if (!userInitialized) {
					initializeUser().then(success => {
						if (success) {
							console.log('User initialization successful')
						} else {
							console.log('User initialization failed')
						}
						setUserInitialized(true)
					})
				}
			}
		}

		return () => {
			document.body.removeChild(script)
		}
	}, [userInitialized])

	useEffect(() => {
		const lp = retrieveLaunchParams()

		if (
			!lp ||
			['macos', 'tdesktop', 'weba', 'web', 'webk'].includes(lp.platform)
		) {
			return
		}

		document.body.classList.add('mobile-body')
		document.getElementById('wrap')?.classList.add('mobile-wrap')
		document.getElementById('content')?.classList.add('mobile-content')
	}, [])

	useEffect(() => {
		if (hasRedirected) return

		const urlParams = new URLSearchParams(window.Telegram.WebApp.initData)
		const startParam = urlParams.get('start_param')

		console.log('Start param received:', startParam)

		if (startParam && startParam.startsWith('course_')) {
			const courseId = startParam.split('_')[1]
			navigate(`/course/${courseId}`)
			setHasRedirected(true)
		} else if (startParam && startParam.startsWith('user_')) {
			const userId = startParam.split('_')[1]
			console.log('Navigating to user profile:', userId)
			navigate(`/user/${userId}`)
			setHasRedirected(true)
		} else if (startParam && startParam === 'profile') {
			navigate('/profile')
			setHasRedirected(true)
		}
	}, [navigate, hasRedirected])

	return (
		<TonConnectUIProvider manifestUrl='https://comncourse.netlify.app/tonconnect-manifest.json'>
			<div id='wrap'>
				<div id='content'>
					<div className='App'>
						<meta
							name='viewport'
							content='width=device-width, user-scalable=no'
						></meta>
						<Routes>
							<Route index element={<WalletWidget />} />
							<Route
								path={'create'}
								element={
									<>
										<Create /> <NavBar />{' '}
									</>
								}
							/>
							<Route path={'profile'} element={<UserProfile />} />
							<Route path={'subscription'} element={<SubscriptionPage />} />
							<Route path={'edit-profile/:id'} element={<EditProfile />} />
							<Route path={'user/:id'} element={<SellerProfile />} />
							<Route path={'registration'} element={<RegistrationPage />} />
							{/* <Route path={"landing"} element={<LandingPage />} /> */}
							<Route path={'legal'} element={<LegalPage />} />
							<Route
								path={'verification-form'}
								element={<VerificationForm />}
							/>
							<Route path={'connect-payments'} element={<ConnectPayments />} />
							<Route path={'connect-payments-form'} element={<ConnectCard />} />
							<Route path={'return-form'} element={<ReturnForm />} />
						</Routes>
					</div>
				</div>
			</div>
		</TonConnectUIProvider>
	)
}

export default App
