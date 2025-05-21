import MoneyIcon from '@mui/icons-material/AttachMoney';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import OtherHousesIcon from '@mui/icons-material/OtherHouses';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SchoolIcon from '@mui/icons-material/School';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export const CATEGORIES = [
  // Przychody
  { value: "wynagrodzenie", label: "Wynagrodzenie", icon: MoneyIcon, color: "#4caf50" },
  { value: "prezent", label: "Prezent", icon: CardGiftcardIcon, color: "#9c27b0" },
  { value: "inne_przychody", label: "Inne przychody", icon: OtherHousesIcon, color: "#2196f3" },

  // Wydatki
  { value: "jedzenie", label: "Jedzenie", icon: RestaurantIcon, color: "#ff9800" },
  { value: "transport", label: "Transport", icon: DirectionsCarIcon, color: "#607d8b" },
  { value: "rozrywka", label: "Rozrywka", icon: TheaterComedyIcon, color: "#e91e63" },
  { value: "rachunki", label: "Rachunki", icon: ReceiptIcon, color: "#f44336" },
  { value: "zdrowie", label: "Zdrowie", icon: HealthAndSafetyIcon, color: "#00bcd4" },
  { value: "edukacja", label: "Edukacja", icon: SchoolIcon, color: "#3f51b5" },
  { value: "odzież", label: "Odzież", icon: CheckroomIcon, color: "#795548" },
  { value: "inne_wydatki", label: "Inne wydatki", icon: MoreHorizIcon, color: "#9e9e9e" }
];