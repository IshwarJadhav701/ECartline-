package com.ecartline.dto;

import com.ecartline.entity.Address;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AddressDto {
    private Long id;

    @JsonProperty("full_name")
    private String fullName;

    private String phone;
    private String street;
    private String city;
    private String state;
    private String pincode;

    @JsonProperty("is_default")
    private Boolean isDefault = false;

    public AddressDto() {}

    public static AddressDto fromEntity(Address a) {
        if (a == null) return null;
        AddressDto dto = new AddressDto();
        dto.setId(a.getId());
        dto.setFullName(a.getFullName());
        dto.setPhone(a.getPhone());
        dto.setStreet(a.getStreet());
        dto.setCity(a.getCity());
        dto.setState(a.getState());
        dto.setPincode(a.getPincode());
        dto.setIsDefault(a.getIsDefault());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
}
