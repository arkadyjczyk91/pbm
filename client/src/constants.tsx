import FastfoodIcon from '@mui/icons-material/Fastfood';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalMoviesIcon from '@mui/icons-material/LocalMovies';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CategoryIcon from '@mui/icons-material/Category';

export const CATEGORIES = [
  { value: "wynagrodzenie", label: "Wynagrodzenie", color: "#4CAF50", icon: <AttachMoneyIcon /> },
  { value: "prezent", label: "Prezent", color: "#9C27B0", icon: <CardGiftcardIcon /> },
  { value: "inne_przychody", label: "Inne przychody", color: "#2196F3", icon: <MoreHorizIcon /> },
  { value: "jedzenie", label: "Jedzenie", color: "#F44336", icon: <FastfoodIcon /> },
  { value: "transport", label: "Transport", color: "#FF9800", icon: <DirectionsCarIcon /> },
  { value: "rozrywka", label: "Rozrywka", color: "#E91E63", icon: <LocalMoviesIcon /> },
  { value: "rachunki", label: "Rachunki", color: "#607D8B", icon: <ReceiptIcon /> },
  { value: "zdrowie", label: "Zdrowie", color: "#00BCD4", icon: <LocalHospitalIcon /> },
  { value: "edukacja", label: "Edukacja", color: "#3F51B5", icon: <SchoolIcon /> },
  { value: "odzież", label: "Odzież", color: "#795548", icon: <CheckroomIcon /> },
  { value: "inne_wydatki", label: "Inne wydatki", color: "#9E9E9E", icon: <CategoryIcon /> }
];