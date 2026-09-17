package com.talentgrid.backend.company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 255) String website,
        @Size(max = 80) String industry,
        @Size(max = 40) String size,
        @Size(max = 120) String city,
        @Size(max = 5000) String description
) {}
