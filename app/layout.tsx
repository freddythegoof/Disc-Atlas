import type {Metadata} from 'next';
export const metadata:Metadata={title:'Disc Atlas',description:'Explore disc flights, build your bag, and find your next line.',icons:{icon:{url:'/favicon.svg?v=scatter-atlas',type:'image/svg+xml'}}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
