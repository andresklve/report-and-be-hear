package pe.edu.upc.reportandbeheard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ReportandbeheardApplication {

	public static void main(String[] args) {
		SpringApplication.run(ReportandbeheardApplication.class, args);
	}

}
