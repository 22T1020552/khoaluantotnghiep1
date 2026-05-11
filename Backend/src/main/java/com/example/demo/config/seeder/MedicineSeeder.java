package com.example.demo.config.seeder;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Medicine;
import com.example.demo.repository.MedicineRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MedicineSeeder {

    private static final Logger LOGGER = LoggerFactory.getLogger(MedicineSeeder.class);

        private static final List<MedicineSeedItem> DEFAULT_MEDICINES = List.of(
            new MedicineSeedItem("Paracetamol 500mg", "Giảm đau - Hạ sốt", "Viên", new BigDecimal("2000"), 500),
            new MedicineSeedItem("Amoxicillin 500mg", "Kháng sinh", "Viên", new BigDecimal("3500"), 300),
            new MedicineSeedItem("Vitamin C 500mg", "Vitamin", "Viên", new BigDecimal("1500"), 400),
            new MedicineSeedItem("Omeprazole 20mg", "Khác", "Viên", new BigDecimal("2500"), 250),
            new MedicineSeedItem("Cetirizine 10mg", "Dị ứng", "Viên", new BigDecimal("1800"), 350));

    @Value("${app.seed.medicines.enabled:true}")
    private boolean defaultMedicinesEnabled;

    private final MedicineRepository medicineRepository;

    @Transactional
    public void seed() {
        if (!defaultMedicinesEnabled) {
            return;
        }

        int inserted = 0;
        for (MedicineSeedItem item : DEFAULT_MEDICINES) {
            if (medicineRepository.existsByMedicineNameIgnoreCase(item.medicineName())) {
                continue;
            }

            Medicine medicine = new Medicine();
            medicine.setMedicineName(item.medicineName());
            medicine.setMedicineType(item.medicineType());
            medicine.setUnit(item.unit());
            medicine.setSellingPrice(item.sellingPrice());
            medicine.setStockQuantity(item.stockQuantity());
            medicine.setIsActive(true);
            medicineRepository.save(medicine);
            inserted++;
        }

        LOGGER.info("[MedicineSeeder] Seeded medicines: {} newly inserted", inserted);
    }

    private record MedicineSeedItem(
            String medicineName,
            String medicineType,
            String unit,
            BigDecimal sellingPrice,
            Integer stockQuantity) {
    }
}
