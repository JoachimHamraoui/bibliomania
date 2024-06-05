import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

export const loadFonts = async () => {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
  });

//   if (!fontsLoaded) {
//     console.log('Fonts not loaded');
//     return false;
//   }

  return true;
};