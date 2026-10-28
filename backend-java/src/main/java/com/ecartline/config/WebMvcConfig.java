package com.ecartline.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Point to frontend dist/ if built, or legacy ECartline files
        File distDir = new File("../frontend/dist");
        if (distDir.exists() && distDir.isDirectory()) {
            registry.addResourceHandler("/**")
                    .addResourceLocations("file:" + distDir.getAbsolutePath() + "/");
        } else {
            File legacyDir = new File("../ECartline");
            if (legacyDir.exists() && legacyDir.isDirectory()) {
                registry.addResourceHandler("/**")
                        .addResourceLocations("file:" + legacyDir.getAbsolutePath() + "/");
            }
        }
    }
}
