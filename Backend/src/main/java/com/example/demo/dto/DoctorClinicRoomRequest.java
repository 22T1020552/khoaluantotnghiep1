package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoctorClinicRoomRequest {

    @NotBlank(message = "clinicRoom is required")
    private String clinicRoom;
}
