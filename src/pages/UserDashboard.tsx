import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import {
    Box,
    Button,
    Typography,
    List,
    ListItem,
    Paper,
    TextField,
    Autocomplete,
    Card,
    AppBar,
    Toolbar,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Define ParkingSpot type
interface ParkingSpot {
    id: number;
    location: string;
    latitude: number;
    longitude: number;
    price_per_hour: number;
    is_available: boolean;
}

// Default marker
const defaultIcon = new L.Icon({
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Highlighted marker for selected spot
const selectedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Auto-center map on selected spot
const MapUpdater = ({ selectedSpot }: { selectedSpot: ParkingSpot | null }) => {
    const map = useMap();
    useEffect(() => {
        if (selectedSpot) {
            map.flyTo([selectedSpot.latitude, selectedSpot.longitude], 17);
        }
    }, [selectedSpot, map]);
    return null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserDashboard = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [reserving, setReserving] = useState<boolean>(false);
    const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedForReservation, setSelectedForReservation] = useState<ParkingSpot | null>(null);

    useEffect(() => {
        setLoading(true);
        axios
            .get(`${API_BASE_URL}/api/spots/`)
            .then((response) => {
                setParkingSpots(response.data);
                setSelectedSpot(response.data[0]); // Auto-select first spot
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching parking spots:", error);
                setLoading(false);
            });
    }, []);

    // Extract unique street names from parking spots for auto-complete
    const uniqueStreets = Array.from(
        new Set(parkingSpots.map((spot) => spot.location.split("Block of ")[1]?.split(" ")[0] + " " + spot.location.split(" ").slice(-2).join(" ")))
    );

    // Filter spots based on search query
    const filteredSpots = parkingSpots.filter((spot) =>
        spot.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Handle reservation dialog
    const handleOpenDialog = (spot: ParkingSpot) => {
        setSelectedForReservation(spot);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedForReservation(null);
    };

    const handleConfirmReservation = async () => {
        if (!selectedForReservation) return;

        setReserving(true);
        const userId = 1; // Replace with actual user ID from authentication
        const startTime = new Date().toISOString();
        const endTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1-hour reservation
        const totalPrice = selectedForReservation.price_per_hour * 1; // Assume 1 hour

        try {
            const response = await axios.post(`${API_BASE_URL}/api/reserve/`, {
                user: userId, // Send user ID, not email
                parking_spot: selectedForReservation.id,
                start_time: startTime,
                end_time: endTime,
                total_price: totalPrice,
            }, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.message) {
                alert("Reservation successful!");

                // Update UI: Mark the reserved spot as unavailable
                setParkingSpots((prevSpots) =>
                    prevSpots.map((spot) =>
                        spot.id === selectedForReservation.id ? { ...spot, is_available: false } : spot
                    )
                );
                setReserving(false);
                setOpenDialog(false);
            }
        }
        /* eslint-disable  @typescript-eslint/no-explicit-any */
        catch (error: any) {
            alert("Reservation failed: " + (error.response?.data?.error || "Unknown error"));
            setReserving(false);
        }
    };


    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Top Navigation Bar */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h5" sx={{ flexGrow: 1, textAlign: "center" }}>
                        Squirrel Hill Parking
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ display: "flex", flex: 1, p: 3, gap: 3 }}>
                {/* Map Section in a Card */}
                <Card sx={{ flex: 3, borderRadius: 3, boxShadow: 3, height: "85vh" }}>
                    <MapContainer center={[40.428, -79.922]} zoom={16} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater selectedSpot={selectedSpot} />
                        {filteredSpots.map((spot) => (
                            <Marker
                                key={spot.id}
                                position={[spot.latitude, spot.longitude]}
                                icon={selectedSpot?.id === spot.id ? selectedIcon : defaultIcon}
                            >
                                <Popup>
                                    <Typography variant="h6">{spot.location}</Typography>
                                    <Typography variant="body2">Price: ${spot.price_per_hour}/hr</Typography>
                                    <Typography variant="body2">
                                        Status: {spot.is_available ? "Available" : "Occupied"}
                                    </Typography>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </Card>

                {/* List View Section */}
                <Card sx={{ flex: 2, height: "85vh", borderRadius: 3, boxShadow: 3 }}>
                    {loading && (
                        <CircularProgress size={40}></CircularProgress>
                    )}
                    {!loading && (
                        <Box sx={{ p: 2 }}>
                            {/* Search Bar (Autocomplete based on Street Names) */}
                            <Autocomplete
                                options={uniqueStreets}
                                freeSolo
                                onInputChange={(_, value) => setSearchQuery(value)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search Parking Spots..."
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: "50px",
                                                backgroundColor: "#f0f0f0",
                                            },
                                        }}
                                    />
                                )}
                            />

                            <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>
                                Available Parking Spots
                            </Typography>

                            <Paper elevation={3} sx={{ maxHeight: "68vh", overflowY: "auto" }}>
                                <List>
                                    {filteredSpots.map((spot) => (
                                        <ListItem
                                            component="li"  // Ensures correct HTML tag usage
                                            key={spot.id}
                                            onClick={() => setSelectedSpot(spot)}
                                            sx={{
                                                backgroundColor: selectedSpot?.id === spot.id ? "#e3f2fd" : "transparent",
                                                borderLeft: selectedSpot?.id === spot.id ? "5px solid blue" : "none",
                                                transition: "0.3s",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="body1">{spot.location}</Typography>
                                                <Typography variant="body2">${spot.price_per_hour}/hr</Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        backgroundColor: spot.is_available ? "green" : "red",
                                                    }}
                                                />
                                                {spot.is_available && (
                                                    <Button variant="contained" color="primary" size="small" onClick={() => handleOpenDialog(spot)}>
                                                        {reserving && <CircularProgress size="30px"></CircularProgress>}
                                                        {!reserving && "Reserve"}
                                                    </Button>
                                                )}
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    )}
                </Card>
            </Box>

            {/* Reservation Confirmation Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirm Reservation</DialogTitle>
                <DialogContent>
                    <Typography>Proceed with reservation for {selectedForReservation?.location}?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
                    <Button onClick={handleConfirmReservation} color="primary">Proceed</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserDashboard;
