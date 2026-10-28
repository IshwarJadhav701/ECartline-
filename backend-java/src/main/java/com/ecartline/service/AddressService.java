package com.ecartline.service;

import com.ecartline.dto.AddressDto;
import com.ecartline.entity.Address;
import com.ecartline.exception.ApiException;
import com.ecartline.repository.AddressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class AddressService {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^[6-9]\\d{9}$");
    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<AddressDto> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByIsDefaultDescIdDesc(userId).stream()
                .map(AddressDto::fromEntity)
                .toList();
    }

    @Transactional
    public AddressDto createAddress(Long userId, AddressDto dto) {
        String fullName = dto.getFullName() != null ? dto.getFullName().trim() : "";
        String phone = dto.getPhone() != null ? dto.getPhone().trim() : "";
        String street = dto.getStreet() != null ? dto.getStreet().trim() : "";
        String city = dto.getCity() != null ? dto.getCity().trim() : "";
        String state = dto.getState() != null ? dto.getState().trim() : "";
        String pincode = dto.getPincode() != null ? dto.getPincode().trim() : "";

        if (fullName.length() < 2) throw new ApiException(HttpStatus.BAD_REQUEST, "Full name is required");
        if (!PHONE_PATTERN.matcher(phone).matches()) throw new ApiException(HttpStatus.BAD_REQUEST, "Valid 10-digit phone number is required");
        if (street.length() < 5) throw new ApiException(HttpStatus.BAD_REQUEST, "Street/House details are required");
        if (city.isEmpty() || state.isEmpty() || pincode.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "City, state, and pincode are required");

        long count = addressRepository.countByUserId(userId);
        boolean shouldBeDefault = Boolean.TRUE.equals(dto.getIsDefault()) || count == 0;

        if (shouldBeDefault) {
            addressRepository.clearDefaultAddresses(userId);
        }

        Address a = new Address();
        a.setUserId(userId);
        a.setFullName(fullName);
        a.setPhone(phone);
        a.setStreet(street);
        a.setCity(city);
        a.setState(state);
        a.setPincode(pincode);
        a.setIsDefault(shouldBeDefault);

        a = addressRepository.save(a);
        return AddressDto.fromEntity(a);
    }

    @Transactional
    public AddressDto updateAddress(Long userId, Long addressId, AddressDto dto) {
        Address a = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Address not found"));

        if (dto.getFullName() != null && !dto.getFullName().trim().isEmpty()) {
            a.setFullName(dto.getFullName().trim());
        }
        if (dto.getPhone() != null && !dto.getPhone().trim().isEmpty()) {
            if (!PHONE_PATTERN.matcher(dto.getPhone().trim()).matches()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Valid 10-digit phone number is required");
            }
            a.setPhone(dto.getPhone().trim());
        }
        if (dto.getStreet() != null && !dto.getStreet().trim().isEmpty()) {
            a.setStreet(dto.getStreet().trim());
        }
        if (dto.getCity() != null && !dto.getCity().trim().isEmpty()) {
            a.setCity(dto.getCity().trim());
        }
        if (dto.getState() != null && !dto.getState().trim().isEmpty()) {
            a.setState(dto.getState().trim());
        }
        if (dto.getPincode() != null && !dto.getPincode().trim().isEmpty()) {
            a.setPincode(dto.getPincode().trim());
        }

        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            addressRepository.clearDefaultAddresses(userId);
            a.setIsDefault(true);
        }

        a = addressRepository.save(a);
        return AddressDto.fromEntity(a);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        Address a = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Address not found"));
        addressRepository.delete(a);
    }

    @Transactional
    public AddressDto setDefaultAddress(Long userId, Long addressId) {
        Address a = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Address not found"));

        addressRepository.clearDefaultAddresses(userId);
        a.setIsDefault(true);
        a = addressRepository.save(a);
        return AddressDto.fromEntity(a);
    }
}
