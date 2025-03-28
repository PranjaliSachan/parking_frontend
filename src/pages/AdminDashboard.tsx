import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import {
    Box,
    Card,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    AppBar,
    Toolbar,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

// Define ParkingSpot type
interface ParkingSpot {
    id: number;
    location: string;
    latitude: number;
    longitude: number;
    price_per_hour: number;
    is_available: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
    const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
    const [filteredSpots, setFilteredSpots] = useState<ParkingSpot[]>([]);
    const [locationFilter, setLocationFilter] = useState<string>("");
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
    });
    const [sortOption, setSortOption] = useState<string>("");

    useEffect(() => {
        axios.get(`${API_BASE_URL}/api/spots/`).then((response) => {
            setParkingSpots(response.data);
            setFilteredSpots(response.data);
        });
    }, []);

    // Extract unique street names for location filter
    const uniqueStreets = Array.from(
        new Set(parkingSpots.map((spot) => spot.location.split("Block of ")[1]?.split(" ")[0] + " " + spot.location.split(" ").slice(-2).join(" ")))
    );

    // Handle filtering logic
    useEffect(() => {
        let filtered = parkingSpots;

        if (locationFilter) {
            filtered = filtered.filter((spot) => spot.location.includes(locationFilter));
        }

        if (dateRange.start && dateRange.end) {
            // Mock filtering by date (since parking spots themselves don’t have dates, we would need reservation data)
            filtered = filtered.filter((spot) =>
                spot.id % 2 === 0 ? dayjs(dateRange.start).isBefore(dayjs()) : dayjs(dateRange.end).isAfter(dayjs())
            );
        }

        if (sortOption === "availability") {
            filtered.sort((a, b) => Number(b.is_available) - Number(a.is_available));
        } else if (sortOption === "location") {
            filtered.sort((a, b) => a.location.localeCompare(b.location));
        }

        setFilteredSpots(filtered);
    }, [locationFilter, dateRange, sortOption, parkingSpots]);

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Top Navigation Bar */}
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h5" sx={{ flexGrow: 1, textAlign: "center" }}>
                        Squirrel Hill - Parking Management Admin Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Statistics */}
            <Box sx={{ display: "flex", px: 3, gap: 3 }}>
                <Card sx={{ flex: 1, p: 2, textAlign: "center", borderRadius: 3, boxShadow: 3, height: "100px" }}>
                    <Typography variant="h6">Total Available Spots</Typography>
                    <Typography variant="h4" sx={{ color: "green" }}>{parkingSpots.filter((spot) => spot.is_available).length}</Typography>
                </Card>
                <Card sx={{ flex: 1, p: 2, textAlign: "center", borderRadius: 3, boxShadow: 3, height: "100px" }}>
                    <Typography variant="h6">Total Reserved Spots</Typography>
                    <Typography variant="h4" sx={{ color: "red" }}>{parkingSpots.length - parkingSpots.filter((spot) => spot.is_available).length}</Typography>
                </Card>
            </Box>

            {/* Main Content - Map & Table */}
            <Box sx={{ display: "flex", flex: 1, px: 3, gap: 3 }}>
                {/* Small Map View (30%) */}
                <Card sx={{ flex: 3, borderRadius: 3, boxShadow: 3, height: "600px" }}>
                    <MapContainer center={[40.428, -79.922]} zoom={16} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {parkingSpots.map((spot) => (
                            <Marker key={spot.id} position={[spot.latitude, spot.longitude]}>
                                <Popup>
                                    <Typography variant="h6">{spot.location}</Typography>
                                    <Typography>Status: {spot.is_available ? "Available" : "Reserved"}</Typography>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </Card>

                {/* Table View (70%) */}
                <Card sx={{ flex: 7, borderRadius: 3, boxShadow: 3, p: 2, height: "600px", overflowY: "auto" }}>
                    {/* Filters - Fixed Width & Spacing */}
                    <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                        <FormControl fullWidth sx={{ minWidth: "200px" }}>
                            <InputLabel>Filter by Location</InputLabel>
                            <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                                <MenuItem value="">All</MenuItem>
                                {uniqueStreets.map((street) => (
                                    <MenuItem key={street} value={street}>{street}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <DatePicker
                            label="Start Date"
                            value={dateRange.start ? dayjs(dateRange.start) : null}
                            onChange={(newValue) => setDateRange({ ...dateRange, start: newValue ? newValue.toISOString() : null })}
                            slotProps={{ textField: { variant: "outlined", fullWidth: true, sx: { minWidth: "160px" } } }}
                        />

                        <DatePicker
                            label="End Date"
                            value={dateRange.end ? dayjs(dateRange.end) : null}
                            onChange={(newValue) => setDateRange({ ...dateRange, end: newValue ? newValue.toISOString() : null })}
                            slotProps={{ textField: { variant: "outlined", fullWidth: true, sx: { minWidth: "160px" } } }}
                        />

                        <FormControl fullWidth sx={{ minWidth: "200px" }}>
                            <InputLabel>Sort By</InputLabel>
                            <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                                <MenuItem value="availability">Availability</MenuItem>
                                <MenuItem value="location">Location</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* Parking Spots Table */}
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Price/hr</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredSpots.map((spot) => (
                                    <TableRow key={spot.id}>
                                        <TableCell>{spot.location}</TableCell>
                                        <TableCell>${spot.price_per_hour}</TableCell>
                                        <TableCell style={{ color: spot.is_available ? "green" : "red" }}>
                                            {spot.is_available ? "Available" : "Reserved"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
